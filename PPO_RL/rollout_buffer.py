"""
rollout_buffer.py
-----------------
On-policy rollout buffer for PPO.

"""

import numpy as np
import torch


def create_rollout_buffer(rollout_steps: int, obs_dim: int):
    """Allocate a fresh rollout buffer for `rollout_steps` transitions."""
    return {
        "obs":       np.zeros((rollout_steps, obs_dim), dtype=np.float32),
        "action":    np.zeros((rollout_steps, 1),       dtype=np.float32),
        "reward":    np.zeros((rollout_steps, 1),       dtype=np.float32),
        "done":      np.zeros((rollout_steps, 1),       dtype=np.float32),
        "log_prob":  np.zeros((rollout_steps, 1),       dtype=np.float32),
        "value":     np.zeros((rollout_steps, 1),       dtype=np.float32),
        # Computed after rollout ends via compute_gae()
        "advantage": np.zeros((rollout_steps, 1),       dtype=np.float32),
        "returns":   np.zeros((rollout_steps, 1),       dtype=np.float32),
        "ptr":       0,
        "capacity":  rollout_steps,
    }


def rollout_push(buffer, obs, action, reward, done, log_prob, value):
    """Append one transition. Raises if buffer is already full."""
    idx = buffer["ptr"]
    if idx >= buffer["capacity"]:
        raise RuntimeError("Rollout buffer is full — call compute_gae then clear it.")

    buffer["obs"][idx]      = obs
    buffer["action"][idx]   = action
    buffer["reward"][idx]   = reward
    buffer["done"][idx]     = float(done)
    buffer["log_prob"][idx] = log_prob
    buffer["value"][idx]    = value
    buffer["ptr"]           = idx + 1


def rollout_full(buffer) -> bool:
    return buffer["ptr"] >= buffer["capacity"]


def rollout_size(buffer) -> int:
    return buffer["ptr"]


def compute_gae(buffer, last_value: float, gamma: float, gae_lambda: float):
    """
    Compute Generalised Advantage Estimation (GAE) and discounted returns
    in-place. Call once at the end of a rollout before sampling mini-batches.

    last_value: bootstrap V(s_T) — 0.0 if episode terminated naturally.
    """
    n   = buffer["ptr"]
    gae = 0.0

    for t in reversed(range(n)):
        next_value = last_value if t == n - 1 else buffer["value"][t + 1, 0]
        next_done  = buffer["done"][t, 0]

        delta = (buffer["reward"][t, 0]
                 + gamma * next_value * (1.0 - next_done)
                 - buffer["value"][t, 0])
        gae   = delta + gamma * gae_lambda * (1.0 - next_done) * gae

        buffer["advantage"][t, 0] = gae
        buffer["returns"][t, 0]   = gae + buffer["value"][t, 0]


def rollout_get_batches(buffer, mini_batch_size: int):
    """
    Yield randomised mini-batches of tensors from the completed rollout.
    Normalises advantages across the whole rollout before yielding.
    """
    n   = buffer["ptr"]
    adv = buffer["advantage"][:n].copy()
    adv = (adv - adv.mean()) / (adv.std() + 1e-8)

    indices = np.random.permutation(n)

    for start in range(0, n, mini_batch_size):
        idx = indices[start : start + mini_batch_size]
        yield {
            "obs":       torch.FloatTensor(buffer["obs"][idx]),
            "action":    torch.FloatTensor(buffer["action"][idx]),
            "log_prob":  torch.FloatTensor(buffer["log_prob"][idx]),
            "value":     torch.FloatTensor(buffer["value"][idx]),
            "advantage": torch.FloatTensor(adv[idx]),
            "returns":   torch.FloatTensor(buffer["returns"][idx]),
        }


def rollout_clear(buffer):
    """Reset pointer so the buffer can be reused for the next rollout."""
    buffer["ptr"] = 0