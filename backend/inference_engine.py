import numpy as np
from environment import env_reset, env_step, get_observation
from networks import sample_action

def run_inference(actor, pair_data, config):
    results = []

    for (test_data, pair_type, pair_info) in pair_data:
        features, prices_a, prices_b, dates = test_data
        stock_a, stock_b, _, strength = pair_info

        state = env_reset(
            prices_a,
            prices_b,
            features,
            pair_type,
            config["initial_capital"],
            config["transaction_cost"]
        )

        obs = get_observation(state, 0 )
        done = False

        while not done:
            action = sample_action(actor, obs, deterministic=True)
            obs, reward, done, info = env_step(state, action, config["action_threshold"])

        results.append({
            "pair": f"{stock_a}-{stock_b}",
            "pair_type": pair_type,
            "gnn_strength": float(strength),
            "final_equity": float(state["equity_curve"][-1]),
            "total_pnl": float(state["total_pnl"]),
            "trades": state["trade_log"]
        })

    return results