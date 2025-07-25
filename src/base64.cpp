#include "base64.h"
#include <algorithm>
#include <cctype>
#include <cstdint>
#include <vector>
#include <string>

std::vector<uint8_t> base64_decode(const std::string& encoded_string) {
    const std::string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    std::vector<uint8_t> decoded;
    
    // Clean the input string (remove whitespace and newlines)
    std::string cleaned;
    for (char c : encoded_string) {
        if (chars.find(c) != std::string::npos || c == '=') {
            cleaned += c;
        }
    }
    
    if (cleaned.empty()) {
        return decoded;
    }
    
    int val = 0, valb = -8;
    for (char c : cleaned) {
        if (chars.find(c) != std::string::npos) {
            val = (val << 6) + static_cast<int>(chars.find(c));
            valb += 6;
            if (valb >= 0) {
                decoded.push_back(static_cast<uint8_t>((val >> valb) & 0xFF));
                valb -= 8;
            }
        }
    }
    
    return decoded;
}
