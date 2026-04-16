"""
networks.py 
--------------------------
PPO uses a single Actor-Critic network with a shared backbone and two heads:
  • Actor head  → mean + log_std  (Gaussian policy, tanh-squashed)
  • Critic head → scalar V(s)     (state-value, NOT Q(s,a))

"""

import torch
import torch.nn as nn
import torch.nn.functional as F

LOG_STD_MIN = -20
LOG_STD_MAX  =  2
EPSILON      = 1e-6


# ── Network construction ──────────────────────────────────────────────────────

def create_actor_critic(obs_dim: int, action_dim: int = 1, hidden_dim: int = 256):
    """
    Build a shared-backbone Actor-Critic network.
    """
    backbone = nn.Sequential(
        nn.Linear(obs_dim, hidden_dim),
        nn.Tanh(),
        nn.Linear(hidden_dim, hidden_dim),
        nn.Tanh(),
    )

    mean_head    = nn.Linear(hidden_dim, action_dim)
    log_std_head = nn.Linear(hidden_dim, action_dim)
    value_head   = nn.Linear(hidden_dim, 1)

    # Small init on output layers (standard PPO practice)
    for head in (mean_head, log_std_head, value_head):
        nn.init.orthogonal_(head.weight, gain=0.01)
        nn.init.zeros_(head.bias)

    all_params = (
        list(backbone.parameters())
        + list(mean_head.parameters())
        + list(log_std_head.parameters())
        + list(value_head.parameters())
    )

    return {
        "backbone":   backbone,
        "mean":       mean_head,
        "log_std":    log_std_head,
        "value_head": value_head,
        "params":     all_params,
    }


# ── Forward passes ────────────────────────────────────────────────────────────

def actor_critic_forward(net, obs):
    """Full forward pass → mean, log_std, value."""
    h       = net["backbone"](obs)
    mean    = net["mean"](h)
    log_std = torch.clamp(net["log_std"](h), LOG_STD_MIN, LOG_STD_MAX)
    value   = net["value_head"](h)
    return mean, log_std, value


def get_value(net, obs):
    """Critic-only forward — used for GAE bootstrapping at rollout end."""
    h = net["backbone"](obs)
    return net["value_head"](h)


# ── Action sampling ───────────────────────────────────────────────────────────

def sample_action(net, obs_np, deterministic: bool = False):
    """
    Sample a single action for environment interaction.
    numpy in → (action_float, log_prob_float, value_float) out.
    """
    obs  = torch.FloatTensor(obs_np).unsqueeze(0)
    mean, log_std, value = actor_critic_forward(net, obs)

    if deterministic:
        action_raw = mean
        log_prob   = torch.zeros(1, 1)
    else:
        std        = log_std.exp()
        dist       = torch.distributions.Normal(mean, std)
        x_t        = dist.rsample()
        action_raw = x_t

        log_prob   = dist.log_prob(x_t)
        log_prob  -= torch.log(1 - torch.tanh(x_t).pow(2) + EPSILON)
        log_prob   = log_prob.sum(dim=-1, keepdim=True)

    action = torch.tanh(action_raw)
    return (
        action.squeeze().detach().numpy().item(),
        log_prob.squeeze().detach().item(),
        value.squeeze().detach().item(),
    )


def sample_action_compat(net, obs_np, deterministic: bool = False):
    action, _, _ = sample_action(net, obs_np, deterministic=deterministic)
    return action


def evaluate_actions(net, obs, action):
    """
    Re-evaluate stored actions during the PPO update.
    Returns log_prob, entropy, value for the given (obs, action) pairs.
    """
    mean, log_std, value = actor_critic_forward(net, obs)
    std  = log_std.exp()
    dist = torch.distributions.Normal(mean, std)

    # Invert tanh to get the pre-squash action
    action_clipped = torch.clamp(action, -1 + EPSILON, 1 - EPSILON)
    x_t = torch.atanh(action_clipped)

    log_prob  = dist.log_prob(x_t)
    log_prob -= torch.log(1 - action.pow(2) + EPSILON)
    log_prob  = log_prob.sum(dim=-1, keepdim=True)

    entropy = dist.entropy().sum(dim=-1, keepdim=True)

    return log_prob, entropy, value


# ── PPO Loss ──────────────────────────────────────────────────────────────────

def compute_ppo_loss(net, batch, clip_epsilon, value_coef, entropy_coef):
    """
    Combined PPO loss for one mini-batch:
    L = -L_CLIP  +  value_coef * L_VALUE  -  entropy_coef * H
    """
    obs       = batch["obs"]
    action    = batch["action"]
    old_lp    = batch["log_prob"]
    advantage = batch["advantage"]
    returns   = batch["returns"]

    log_prob, entropy, value = evaluate_actions(net, obs, action)

    # Policy loss — clipped surrogate objective
    ratio       = torch.exp(log_prob - old_lp)
    surr1       = ratio * advantage
    surr2       = torch.clamp(ratio, 1.0 - clip_epsilon, 1.0 + clip_epsilon) * advantage
    policy_loss = -torch.min(surr1, surr2).mean()

    # Value loss
    value_loss   = F.mse_loss(value, returns)

    # Entropy bonus
    entropy_mean = entropy.mean()

    total_loss = policy_loss + value_coef * value_loss - entropy_coef * entropy_mean

    return total_loss, policy_loss.item(), value_loss.item(), entropy_mean.item()