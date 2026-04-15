import torch
from networks import create_actor

def load_actor(model_path, obs_dim):
    actor = create_actor(obs_dim)

    checkpoint = torch.load(model_path, map_location="cpu")
    
    actor["net"].load_state_dict(checkpoint["net"])
    actor["mean"].load_state_dict(checkpoint["mean"])
    actor["log_std"].load_state_dict(checkpoint["log_std"])

    return actor