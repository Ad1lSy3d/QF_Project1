import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
POSITIVE_PAIRS_PATH = os.path.join(BASE_DIR, "..", "notebooks", "discovered_positive_pairs.csv")
NEGATIVE_PAIRS_PATH = os.path.join(BASE_DIR, "..", "notebooks", "discovered_negative_pairs.csv")
PRICE_DATA_PATH     = os.path.join(BASE_DIR, "..", "notebooks", "merged_data.csv")
RESULTS_DIR         = os.path.join(BASE_DIR, "results")

# ── Trading Parameters ────────────────────────────────────────────────────────
INITIAL_CAPITAL   = 10_000
TRANSACTION_COST  = 0.001
ACTION_THRESHOLD  = 0.2
TRAIN_TEST_SPLIT  = 0.8

# ── Network ───────────────────────────────────────────────────────────────────
HIDDEN_DIM        = 256

# ── PPO Core Hyperparameters ──────────────────────────────────────────────────
LEARNING_RATE     = 3e-4
GAMMA             = 0.99
GAE_LAMBDA        = 0.95         # GAE λ — bias/variance trade-off
CLIP_EPSILON      = 0.2          # PPO clipping range
VALUE_COEF        = 0.5          # Critic loss weight
ENTROPY_COEF      = 0.01         # Entropy bonus (encourages exploration)
MAX_GRAD_NORM     = 0.5          # Gradient clipping

# ── Rollout & Update Schedule ─────────────────────────────────────────────────
ROLLOUT_STEPS     = 512          # Steps before each PPO update (~4 updates/episode)
PPO_EPOCHS        = 10           # Gradient epochs per rollout
MINI_BATCH_SIZE   = 64           # Mini-batch size inside each PPO epoch

# ── Training ──────────────────────────────────────────────────────────────────
NUM_EPISODES      = 200         

# ── Environment ───────────────────────────────────────────────────────────────
LOOKBACK_WINDOW   = 20
MULTI_PAIR        = False