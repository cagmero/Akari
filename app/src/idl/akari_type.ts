/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/akari.json`.
 */
export type Akari = {
  "address": "BbakYETxcQ98AJmmtFKHx6H8ytXHhUMsZAZdmch99Rrn",
  "metadata": {
    "name": "akari",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "acquireRelayLock",
      "discriminator": [
        89,
        139,
        249,
        172,
        26,
        233,
        173,
        142
      ],
      "accounts": [
        {
          "name": "oracleRelayLock",
          "writable": true
        },
        {
          "name": "caller",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "deployYield",
      "discriminator": [
        127,
        139,
        43,
        64,
        236,
        8,
        249,
        240
      ],
      "accounts": [
        {
          "name": "yieldPosition",
          "writable": true
        },
        {
          "name": "poolVault",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "currency",
          "type": "u8"
        },
        {
          "name": "venue",
          "type": {
            "array": [
              "u8",
              16
            ]
          }
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "ixData",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "deposit",
      "discriminator": [
        242,
        35,
        198,
        137,
        82,
        225,
        242,
        182
      ],
      "accounts": [
        {
          "name": "subsidiaryAccount",
          "writable": true
        },
        {
          "name": "poolVault",
          "writable": true
        },
        {
          "name": "subsidiaryAta",
          "writable": true
        },
        {
          "name": "poolAta",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "currency",
          "type": "u8"
        }
      ]
    },
    {
      "name": "flagWallet",
      "discriminator": [
        234,
        219,
        233,
        152,
        83,
        29,
        198,
        23
      ],
      "accounts": [
        {
          "name": "subsidiaryAccount",
          "writable": true
        },
        {
          "name": "poolVault"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "flagged",
          "type": "bool"
        }
      ]
    },
    {
      "name": "fxSwap",
      "discriminator": [
        254,
        10,
        190,
        91,
        163,
        168,
        123,
        91
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "subsidiaryAccount",
          "writable": true
        },
        {
          "name": "poolVault",
          "writable": true
        },
        {
          "name": "epochState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  112,
                  111,
                  99,
                  104,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "currencyPair"
              }
            ]
          }
        },
        {
          "name": "sixPriceFeed"
        }
      ],
      "args": [
        {
          "name": "fromCurrency",
          "type": "u8"
        },
        {
          "name": "toCurrency",
          "type": "u8"
        },
        {
          "name": "inAmount",
          "type": "u64"
        },
        {
          "name": "currencyPair",
          "type": {
            "array": [
              "u8",
              8
            ]
          }
        },
        {
          "name": "ixData",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "harvestYield",
      "discriminator": [
        28,
        200,
        150,
        200,
        69,
        56,
        38,
        133
      ],
      "accounts": [
        {
          "name": "yieldPosition",
          "writable": true
        },
        {
          "name": "poolVault",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "ixData",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "initializeEpochState",
      "discriminator": [
        139,
        122,
        53,
        254,
        85,
        205,
        138,
        245
      ],
      "accounts": [
        {
          "name": "epochState",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  101,
                  112,
                  111,
                  99,
                  104,
                  95,
                  115,
                  116,
                  97,
                  116,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "currencyPair"
              }
            ]
          }
        },
        {
          "name": "poolVault"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "currencyPair",
          "type": {
            "array": [
              "u8",
              8
            ]
          }
        },
        {
          "name": "epochDuration",
          "type": "i64"
        },
        {
          "name": "maxEpochSlippageBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "initializeOracleRelayLock",
      "discriminator": [
        230,
        104,
        247,
        74,
        43,
        35,
        139,
        3
      ],
      "accounts": [
        {
          "name": "oracleRelayLock",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  97,
                  99,
                  108,
                  101,
                  95,
                  114,
                  101,
                  108,
                  97,
                  121,
                  95,
                  108,
                  111,
                  99,
                  107
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializePool",
      "discriminator": [
        95,
        180,
        10,
        172,
        84,
        174,
        232,
        40
      ],
      "accounts": [
        {
          "name": "poolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "oracleAuthority",
          "type": "pubkey"
        },
        {
          "name": "travelRuleThreshold",
          "type": "u64"
        },
        {
          "name": "dailyLimitUsdc",
          "type": "u64"
        },
        {
          "name": "maxSlippageBps",
          "type": "u16"
        }
      ]
    },
    {
      "name": "pausePool",
      "discriminator": [
        160,
        15,
        12,
        189,
        160,
        0,
        243,
        245
      ],
      "accounts": [
        {
          "name": "poolVault",
          "writable": true
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "paused",
          "type": "bool"
        }
      ]
    },
    {
      "name": "registerSubsidiary",
      "discriminator": [
        34,
        128,
        241,
        166,
        178,
        141,
        29,
        74
      ],
      "accounts": [
        {
          "name": "subsidiaryAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  117,
                  98,
                  115,
                  105,
                  100,
                  105,
                  97,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "owner"
              }
            ]
          }
        },
        {
          "name": "poolVault"
        },
        {
          "name": "owner"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "kycHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "sourceOfFundsHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "vaspId",
          "type": {
            "array": [
              "u8",
              16
            ]
          }
        }
      ]
    },
    {
      "name": "renewRelayLock",
      "discriminator": [
        138,
        24,
        120,
        197,
        172,
        119,
        245,
        34
      ],
      "accounts": [
        {
          "name": "oracleRelayLock",
          "writable": true
        },
        {
          "name": "caller",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "travelRuleAttach",
      "discriminator": [
        63,
        243,
        111,
        81,
        125,
        122,
        8,
        235
      ],
      "accounts": [
        {
          "name": "travelRuleRecord",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  97,
                  118,
                  101,
                  108,
                  95,
                  114,
                  117,
                  108,
                  101
                ]
              },
              {
                "kind": "arg",
                "path": "txId"
              }
            ]
          }
        },
        {
          "name": "subsidiaryAccount",
          "writable": true
        },
        {
          "name": "poolVault"
        },
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "txId",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "senderVaspId",
          "type": {
            "array": [
              "u8",
              16
            ]
          }
        },
        {
          "name": "receiverVaspId",
          "type": {
            "array": [
              "u8",
              16
            ]
          }
        },
        {
          "name": "beneficiaryNameHash",
          "type": {
            "array": [
              "u8",
              32
            ]
          }
        },
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "currency",
          "type": "u8"
        }
      ]
    },
    {
      "name": "updateFxRate",
      "discriminator": [
        81,
        49,
        150,
        190,
        196,
        12,
        28,
        207
      ],
      "accounts": [
        {
          "name": "poolVault"
        },
        {
          "name": "sixPriceFeed",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  105,
                  120,
                  95,
                  112,
                  114,
                  105,
                  99,
                  101,
                  95,
                  102,
                  101,
                  101,
                  100
                ]
              },
              {
                "kind": "arg",
                "path": "currencyPair"
              }
            ]
          }
        },
        {
          "name": "oracleRelayLock"
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "currencyPair",
          "type": {
            "array": [
              "u8",
              8
            ]
          }
        },
        {
          "name": "bid",
          "type": "i64"
        },
        {
          "name": "ask",
          "type": "i64"
        },
        {
          "name": "publishedAt",
          "type": "i64"
        }
      ]
    },
    {
      "name": "withdraw",
      "discriminator": [
        183,
        18,
        70,
        156,
        148,
        109,
        161,
        34
      ],
      "accounts": [
        {
          "name": "subsidiaryAccount",
          "writable": true
        },
        {
          "name": "poolVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  111,
                  111,
                  108,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "subsidiaryAta",
          "writable": true
        },
        {
          "name": "poolAta",
          "writable": true
        },
        {
          "name": "mint"
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenProgram"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "currency",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "epochState",
      "discriminator": [
        191,
        63,
        139,
        237,
        144,
        12,
        223,
        210
      ]
    },
    {
      "name": "oracleRelayLock",
      "discriminator": [
        211,
        155,
        191,
        1,
        116,
        24,
        91,
        215
      ]
    },
    {
      "name": "poolVault",
      "discriminator": [
        9,
        184,
        204,
        69,
        231,
        82,
        252,
        154
      ]
    },
    {
      "name": "sixPriceFeed",
      "discriminator": [
        115,
        183,
        227,
        38,
        239,
        206,
        107,
        207
      ]
    },
    {
      "name": "subsidiaryAccount",
      "discriminator": [
        15,
        32,
        152,
        35,
        33,
        185,
        211,
        226
      ]
    },
    {
      "name": "travelRuleRecord",
      "discriminator": [
        2,
        179,
        102,
        25,
        10,
        202,
        48,
        152
      ]
    },
    {
      "name": "yieldPosition",
      "discriminator": [
        77,
        217,
        160,
        86,
        158,
        186,
        248,
        193
      ]
    }
  ],
  "events": [
    {
      "name": "fxSwapEvent",
      "discriminator": [
        11,
        16,
        187,
        220,
        83,
        87,
        156,
        222
      ]
    },
    {
      "name": "oracleUpdateEvent",
      "discriminator": [
        73,
        90,
        83,
        201,
        125,
        98,
        17,
        252
      ]
    },
    {
      "name": "relayLockEvent",
      "discriminator": [
        61,
        132,
        8,
        134,
        239,
        32,
        4,
        169
      ]
    },
    {
      "name": "transferEvent",
      "discriminator": [
        100,
        10,
        46,
        113,
        8,
        28,
        179,
        125
      ]
    },
    {
      "name": "travelRuleEvent",
      "discriminator": [
        114,
        24,
        203,
        207,
        181,
        13,
        215,
        220
      ]
    },
    {
      "name": "yieldDeployedEvent",
      "discriminator": [
        56,
        21,
        144,
        240,
        85,
        245,
        201,
        45
      ]
    },
    {
      "name": "yieldHarvestedEvent",
      "discriminator": [
        12,
        181,
        189,
        61,
        84,
        171,
        252,
        79
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "unknownAccountVersion",
      "msg": "Account version is unknown or unsupported."
    },
    {
      "code": 6001,
      "name": "invalidOracleAuthority",
      "msg": "Signer is not the authorized oracle authority."
    },
    {
      "code": 6002,
      "name": "relayLockNotHeld",
      "msg": "Oracle relay lock is required but not held."
    },
    {
      "code": 6003,
      "name": "relayLockHeldByAnother",
      "msg": "Oracle relay lock is currently held by another relay."
    },
    {
      "code": 6004,
      "name": "epochSlippageBudgetExhausted",
      "msg": "Epoch slippage budget exceeded."
    },
    {
      "code": 6005,
      "name": "slippageExceeded",
      "msg": "Per-swap slippage limit exceeded."
    },
    {
      "code": 6006,
      "name": "insufficientLiquidity",
      "msg": "Internal liquidity insufficient for swap."
    },
    {
      "code": 6007,
      "name": "insufficientIdleBalance",
      "msg": "Insufficient idle balance to deploy yield."
    },
    {
      "code": 6008,
      "name": "oracleStale",
      "msg": "Oracle prices are stale."
    },
    {
      "code": 6009,
      "name": "flaggedWallet",
      "msg": "Subsidiary wallet is flagged for AML."
    },
    {
      "code": 6010,
      "name": "dailyLimitExceeded",
      "msg": "Daily transfer limit exceeded."
    },
    {
      "code": 6011,
      "name": "poolPaused",
      "msg": "Pool is currently paused."
    },
    {
      "code": 6012,
      "name": "travelRuleRequired",
      "msg": "Travel rule data is required for this transfer amount."
    },
    {
      "code": 6013,
      "name": "unauthorized",
      "msg": "Unauthorized access."
    }
  ],
  "types": [
    {
      "name": "epochState",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currencyPair",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "epochStart",
            "type": "i64"
          },
          {
            "name": "epochDuration",
            "type": "i64"
          },
          {
            "name": "epochAccumulatedSlippage",
            "type": "u64"
          },
          {
            "name": "maxEpochSlippageBps",
            "type": "u16"
          },
          {
            "name": "vaultNavSnapshotUsdc",
            "type": "u64"
          },
          {
            "name": "totalSwapsThisEpoch",
            "type": "u32"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "fxSwapEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "subsidiary",
            "type": "pubkey"
          },
          {
            "name": "fromCurrency",
            "type": "u8"
          },
          {
            "name": "toCurrency",
            "type": "u8"
          },
          {
            "name": "inAmount",
            "type": "u64"
          },
          {
            "name": "expectedOutAmount",
            "type": "u64"
          },
          {
            "name": "actualOutAmount",
            "type": "u64"
          },
          {
            "name": "spreadBps",
            "type": "u16"
          },
          {
            "name": "oracleSource",
            "type": "u8"
          },
          {
            "name": "liquiditySource",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "oracleRelayLock",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "holder",
            "type": "pubkey"
          },
          {
            "name": "acquiredAt",
            "type": "i64"
          },
          {
            "name": "ttl",
            "type": "i64"
          },
          {
            "name": "renewalCount",
            "type": "u64"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "oracleUpdateEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currencyPair",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "bid",
            "type": "i64"
          },
          {
            "name": "ask",
            "type": "i64"
          },
          {
            "name": "mid",
            "type": "i64"
          },
          {
            "name": "spreadBps",
            "type": "u16"
          },
          {
            "name": "oracleSource",
            "type": "u8"
          },
          {
            "name": "publishedAt",
            "type": "i64"
          },
          {
            "name": "submittedAt",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "poolVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "oracleAuthority",
            "type": "pubkey"
          },
          {
            "name": "travelRuleThreshold",
            "type": "u64"
          },
          {
            "name": "dailyLimitUsdc",
            "type": "u64"
          },
          {
            "name": "totalUsdc",
            "type": "u64"
          },
          {
            "name": "totalEurc",
            "type": "u64"
          },
          {
            "name": "maxSlippageBps",
            "type": "u16"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "relayLockEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "action",
            "type": "u8"
          },
          {
            "name": "holder",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "sixPriceFeed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currencyPair",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "bid",
            "type": "i64"
          },
          {
            "name": "ask",
            "type": "i64"
          },
          {
            "name": "mid",
            "type": "i64"
          },
          {
            "name": "spreadBps",
            "type": "u16"
          },
          {
            "name": "publishedAt",
            "type": "i64"
          },
          {
            "name": "submittedAt",
            "type": "i64"
          },
          {
            "name": "oracleAuthority",
            "type": "pubkey"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "subsidiaryAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "kycHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "sourceOfFundsHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "vaspId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "usdcBalance",
            "type": "u64"
          },
          {
            "name": "eurcBalance",
            "type": "u64"
          },
          {
            "name": "dailyTransferTotal",
            "type": "u64"
          },
          {
            "name": "lastTransferDay",
            "type": "i64"
          },
          {
            "name": "flagged",
            "type": "bool"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "transferEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "from",
            "type": "pubkey"
          },
          {
            "name": "to",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "travelRuleEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "recordPda",
            "type": "pubkey"
          },
          {
            "name": "sender",
            "type": "pubkey"
          },
          {
            "name": "receiver",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "travelRuleRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "senderVaspId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "receiverVaspId",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "beneficiaryNameHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "currency",
            "type": "u8"
          },
          {
            "name": "timestamp",
            "type": "i64"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "yieldDeployedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currency",
            "type": "u8"
          },
          {
            "name": "venue",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "yieldHarvestedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currency",
            "type": "u8"
          },
          {
            "name": "venue",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "yieldAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "yieldPosition",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "currency",
            "type": "u8"
          },
          {
            "name": "venue",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "depositedAmount",
            "type": "u64"
          },
          {
            "name": "sharesHeld",
            "type": "u64"
          },
          {
            "name": "lastHarvestAt",
            "type": "i64"
          },
          {
            "name": "totalYieldHarvested",
            "type": "u64"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    }
  ]
};
