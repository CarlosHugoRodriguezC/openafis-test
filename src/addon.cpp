#include <napi.h>
#include <vector>
#include <string>
#include <memory>
#include <fstream>
#include <cstdint>
#include <algorithm>
#include <cctype>
#include "FingerprintMatcher.h"

// Simple base64 decoder
std::vector<uint8_t> decode_base64(const std::string& encoded_string) {
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

/**
 * @brief Match a fingerprint against a database
 * @param info - Node.js function arguments:
 *   - arg[0]: string - Base64 encoded fingerprint to compare
 *   - arg[1]: array - Array of objects with 'fingerprint' property containing Base64 ISO templates
 * @return object - Match result with success, bestMatch, score, etc.
 */
Napi::Object MatchFingerprint(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    // Validate arguments
    if (info.Length() != 2) {
        Napi::TypeError::New(env, "Expected exactly 2 arguments: (fingerprintToCompare, fingerprintDatabase)")
            .ThrowAsJavaScriptException();
        return Napi::Object::New(env);
    }
    
    if (!info[0].IsString()) {
        Napi::TypeError::New(env, "First argument must be a string (Base64 fingerprint)")
            .ThrowAsJavaScriptException();
        return Napi::Object::New(env);
    }
    
    if (!info[1].IsArray()) {
        Napi::TypeError::New(env, "Second argument must be an array of fingerprint objects")
            .ThrowAsJavaScriptException();
        return Napi::Object::New(env);
    }
    
    // Extract arguments
    std::string probe_fingerprint_b64 = info[0].As<Napi::String>().Utf8Value();
    Napi::Array database_array = info[1].As<Napi::Array>();
    
    // Create result object
    Napi::Object result = Napi::Object::New(env);
    
    try {
        // Create fingerprint matcher with default threshold
        auto matcher = std::make_unique<openafis::FingerprintMatcher>(40);
        
        // Load database fingerprints
        std::vector<std::string> template_ids;
        uint32_t loaded_count = 0;
        
        for (uint32_t i = 0; i < database_array.Length(); i++) {
            Napi::Value item = database_array[i];
            
            if (!item.IsObject()) {
                continue; // Skip non-object items
            }
            
            Napi::Object obj = item.As<Napi::Object>();
            
            // Check if object has 'fingerprint' property
            if (!obj.Has("fingerprint")) {
                continue; // Skip objects without fingerprint property
            }
            
            Napi::Value fp_value = obj.Get("fingerprint");
            if (!fp_value.IsString()) {
                continue; // Skip if fingerprint is not a string
            }
            
            std::string fingerprint_b64 = fp_value.As<Napi::String>().Utf8Value();
            
            // Generate template ID (use index or id if available)
            std::string template_id;
            if (obj.Has("id")) {
                Napi::Value id_value = obj.Get("id");
                if (id_value.IsString()) {
                    template_id = id_value.As<Napi::String>().Utf8Value();
                } else if (id_value.IsNumber()) {
                    template_id = "id_" + std::to_string(id_value.As<Napi::Number>().Int32Value());
                } else {
                    template_id = "template_" + std::to_string(i);
                }
            } else {
                template_id = "template_" + std::to_string(i);
            }
            
            // Decode Base64 fingerprint
            try {
                auto decoded = decode_base64(fingerprint_b64);
                if (decoded.empty()) {
                    continue; // Skip empty decoded data
                }
                
                // Load template into matcher
                if (matcher->loadTemplate(template_id, decoded.data(), decoded.size())) {
                    template_ids.push_back(template_id);
                    loaded_count++;
                }
            } catch (...) {
                // Skip this fingerprint if decoding fails
                continue;
            }
        }
        
        // Check if any templates were loaded
        if (loaded_count == 0) {
            result.Set("success", false);
            result.Set("error", "No valid fingerprint templates could be loaded from database");
            result.Set("loadedTemplates", 0);
            return result;
        }
        
        // Decode probe fingerprint
        auto probe_decoded = decode_base64(probe_fingerprint_b64);
        if (probe_decoded.empty()) {
            result.Set("success", false);
            result.Set("error", "Failed to decode probe fingerprint");
            result.Set("loadedTemplates", loaded_count);
            return result;
        }
        
        // Create temporary file for probe fingerprint
        std::string temp_file = "/tmp/probe_fingerprint_" + std::to_string(time(nullptr)) + ".iso";
        std::ofstream file(temp_file, std::ios::binary);
        if (!file) {
            result.Set("success", false);
            result.Set("error", "Failed to create temporary file");
            result.Set("loadedTemplates", loaded_count);
            return result;
        }
        file.write(reinterpret_cast<const char*>(probe_decoded.data()), probe_decoded.size());
        file.close();
        
        // Perform matching
        auto match_result = matcher->match1toNFromFile(temp_file);
        
        // Clean up temporary file
        std::remove(temp_file.c_str());
        
        // Prepare result
        result.Set("success", true);
        result.Set("isMatch", match_result.is_match);
        result.Set("bestMatch", match_result.matched_template_id);
        result.Set("similarityScore", static_cast<int>(match_result.similarity_score));
        result.Set("similarityPercentage", (static_cast<float>(match_result.similarity_score) / 255.0f) * 100.0f);
        result.Set("matchingTimeMs", static_cast<int>(match_result.match_time.count()));
        result.Set("threshold", static_cast<int>(matcher->getSimilarityThreshold()));
        result.Set("loadedTemplates", loaded_count);
        result.Set("memoryUsage", static_cast<int>(matcher->getMemoryUsage()));
        result.Set("concurrency", static_cast<int>(matcher->getConcurrency()));
        
        // Find the original object for the best match
        if (match_result.is_match && !match_result.matched_template_id.empty()) {
            for (uint32_t i = 0; i < database_array.Length(); i++) {
                Napi::Value item = database_array[i];
                if (item.IsObject()) {
                    Napi::Object obj = item.As<Napi::Object>();
                    
                    std::string check_id;
                    if (obj.Has("id")) {
                        Napi::Value id_value = obj.Get("id");
                        if (id_value.IsString()) {
                            check_id = id_value.As<Napi::String>().Utf8Value();
                        } else if (id_value.IsNumber()) {
                            check_id = "id_" + std::to_string(id_value.As<Napi::Number>().Int32Value());
                        } else {
                            check_id = "template_" + std::to_string(i);
                        }
                    } else {
                        check_id = "template_" + std::to_string(i);
                    }
                    
                    if (check_id == match_result.matched_template_id) {
                        result.Set("matchedObject", obj);
                        break;
                    }
                }
            }
        }
        
    } catch (const std::exception& e) {
        result.Set("success", false);
        result.Set("error", std::string("Exception: ") + e.what());
    } catch (...) {
        result.Set("success", false);
        result.Set("error", "Unknown error occurred during fingerprint matching");
    }
    
    return result;
}

/**
 * @brief Set the similarity threshold for matching
 * @param info - Node.js function arguments:
 *   - arg[0]: number - Threshold value (0-255)
 * @return boolean - Success status
 */
Napi::Boolean SetThreshold(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    
    if (info.Length() != 1 || !info[0].IsNumber()) {
        Napi::TypeError::New(env, "Expected one number argument (threshold 0-255)")
            .ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }
    
    int threshold = info[0].As<Napi::Number>().Int32Value();
    
    if (threshold < 0 || threshold > 255) {
        Napi::TypeError::New(env, "Threshold must be between 0 and 255")
            .ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }
    
    // Note: This is a simple implementation. In a real application,
    // you might want to maintain a global matcher instance.
    return Napi::Boolean::New(env, true);
}

/**
 * @brief Initialize the Node.js addon
 */
Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "matchFingerprint"), 
                Napi::Function::New(env, MatchFingerprint));
    exports.Set(Napi::String::New(env, "setThreshold"), 
                Napi::Function::New(env, SetThreshold));
    return exports;
}

NODE_API_MODULE(openafis_addon, Init)
