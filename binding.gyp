{
  "targets": [
    {
      "target_name": "openafis_addon",
      "sources": [
        "src/addon.cpp",
        "src/FingerprintMatcher.cpp",
        "src/base64.cpp"
      ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")",
        "/usr/local/include",
        "/usr/local/include/openafis"
      ],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"],
      "cflags": ["-std=c++17", "-fPIC"],
      "cflags_cc": ["-std=c++17", "-fPIC"],
      "defines": ["NAPI_DISABLE_CPP_EXCEPTIONS"],
      "link_settings": {
        "libraries": ["-L/usr/local/lib", "-lopenafis"]
      },
      "conditions": [
        [
          "OS=='win'",
          {
            "msvs_settings": {
              "VCCLCompilerTool": {
                "ExceptionHandling": 1
              }
            }
          }
        ]
      ]
    }
  ]
}
