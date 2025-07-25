#include "FingerprintMatcher.h"
#include "MatchMany.h"
#include "TemplateISO19794_2_2005.h"
#include "Fingerprint.h"
#include "Log.h"

#include <algorithm>
#include <unordered_map>
#include <memory>
#include <iostream>

namespace openafis {

using TemplateType = OpenAFIS::TemplateISO19794_2_2005<std::string, OpenAFIS::Fingerprint>;
using Templates = std::vector<TemplateType>;

/**
 * @brief Private implementation class for FingerprintMatcher
 */
class FingerprintMatcher::Impl {
public:
    Templates enrolled_templates;
    OpenAFIS::MatchMany<TemplateType> matcher;
    uint8_t similarity_threshold;
    
    Impl(uint8_t threshold) : similarity_threshold(threshold) {
        // Initialize OpenAFIS logging
        OpenAFIS::Log::init();
    }
    
    /**
     * @brief Find template by ID
     */
    Templates::iterator findTemplate(const std::string& template_id) {
        return std::find_if(enrolled_templates.begin(), enrolled_templates.end(),
            [&template_id](const TemplateType& t) {
                return t.id() == template_id;
            });
    }
    
    /**
     * @brief Find template by ID (const version)
     */
    Templates::const_iterator findTemplate(const std::string& template_id) const {
        return std::find_if(enrolled_templates.begin(), enrolled_templates.end(),
            [&template_id](const TemplateType& t) {
                return t.id() == template_id;
            });
    }
};

FingerprintMatcher::FingerprintMatcher(uint8_t similarity_threshold) 
    : pImpl(std::make_unique<Impl>(similarity_threshold)) {
}

FingerprintMatcher::~FingerprintMatcher() = default;

bool FingerprintMatcher::loadTemplate(const std::string& template_id, const std::string& file_path) {
    try {
        // Check if template with this ID already exists
        if (pImpl->findTemplate(template_id) != pImpl->enrolled_templates.end()) {
            std::cerr << "Template with ID '" << template_id << "' already exists" << std::endl;
            return false;
        }
        
        // Create new template
        TemplateType new_template(template_id);
        
        // Load from file
        if (!new_template.load(file_path)) {
            std::cerr << "Failed to load template from file: " << file_path << std::endl;
            return false;
        }
        
        // Verify template has fingerprints
        if (new_template.fingerprints().empty()) {
            std::cerr << "Template loaded but contains no fingerprints: " << file_path << std::endl;
            return false;
        }
        
        // Add to enrolled templates
        pImpl->enrolled_templates.emplace_back(std::move(new_template));
        
        std::cout << "Successfully loaded template '" << template_id 
                  << "' with " << pImpl->enrolled_templates.back().fingerprints().size() 
                  << " fingerprint(s)" << std::endl;
        
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Exception loading template: " << e.what() << std::endl;
        return false;
    }
}

bool FingerprintMatcher::loadTemplate(const std::string& template_id, const uint8_t* data, size_t length) {
    try {
        // Check if template with this ID already exists
        if (pImpl->findTemplate(template_id) != pImpl->enrolled_templates.end()) {
            std::cerr << "Template with ID '" << template_id << "' already exists" << std::endl;
            return false;
        }
        
        // Debug: Check data length and first few bytes
        std::cout << "Loading template '" << template_id << "' with " << length << " bytes" << std::endl;
        
        // Create new template
        TemplateType new_template(template_id);
        
        if (length >= 8) {
            std::cout << "Header: " << std::hex;
            for (int i = 0; i < 8; i++) {
                std::cout << static_cast<int>(data[i]) << " ";
            }
            std::cout << std::dec << std::endl;
            
            // Check ISO 19794-2 length field (bytes 8-11 after 8-byte magic, big-endian)
            uint32_t header_length = (data[8] << 24) | (data[9] << 16) | (data[10] << 8) | data[11];
            std::cout << "Header length field: " << header_length << ", Actual length: " << length << std::endl;
            
            if (header_length != length) {
                std::cout << "WARNING: Length mismatch - trying to fix header" << std::endl;
                // Create a copy of the data with corrected length
                std::vector<uint8_t> corrected_data(data, data + length);
                corrected_data[8] = (length >> 24) & 0xFF;
                corrected_data[9] = (length >> 16) & 0xFF;
                corrected_data[10] = (length >> 8) & 0xFF;
                corrected_data[11] = length & 0xFF;
                
                // Try loading with corrected data
                if (!new_template.load(corrected_data.data(), corrected_data.size())) {
                    std::cerr << "Failed to load template even with corrected header" << std::endl;
                    return false;
                }
            } else {
                // Normal loading
                if (!new_template.load(data, length)) {
                    std::cerr << "Failed to load template from raw data" << std::endl;
                    return false;
                }
            }
        } else {
            // Data too short
            std::cerr << "Template data too short: " << length << " bytes" << std::endl;
            return false;
        }
        
        // Verify template has fingerprints
        if (new_template.fingerprints().empty()) {
            std::cerr << "Template loaded but contains no fingerprints" << std::endl;
            return false;
        }
        
        // Add to enrolled templates
        pImpl->enrolled_templates.emplace_back(std::move(new_template));
        
        std::cout << "Successfully loaded template '" << template_id 
                  << "' with " << pImpl->enrolled_templates.back().fingerprints().size() 
                  << " fingerprint(s)" << std::endl;
        
        return true;
    } catch (const std::exception& e) {
        std::cerr << "Exception loading template: " << e.what() << std::endl;
        return false;
    }
}

MatchResult FingerprintMatcher::match1to1(const std::string& probe_id, const std::string& candidate_id) {
    MatchResult result;
    
    try {
        // Find probe template
        auto probe_it = pImpl->findTemplate(probe_id);
        if (probe_it == pImpl->enrolled_templates.end()) {
            throw FingerprintMatcherException("Probe template not found: " + probe_id);
        }
        
        // Find candidate template
        auto candidate_it = pImpl->findTemplate(candidate_id);
        if (candidate_it == pImpl->enrolled_templates.end()) {
            throw FingerprintMatcherException("Candidate template not found: " + candidate_id);
        }
        
        // Record start time
        auto start_time = std::chrono::high_resolution_clock::now();
        
        // Perform matching using OpenAFIS
        OpenAFIS::MatchSimilarity matcher;
        uint8_t similarity_score = 0;
        
        // Match first fingerprint from each template
        matcher.compute(similarity_score, 
                       probe_it->fingerprints()[0], 
                       candidate_it->fingerprints()[0]);
        
        // Record end time
        auto end_time = std::chrono::high_resolution_clock::now();
        
        // Fill result
        result.similarity_score = similarity_score;
        result.matched_template_id = candidate_id;
        result.match_time = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time);
        result.is_match = (similarity_score >= pImpl->similarity_threshold);
        
    } catch (const std::exception& e) {
        std::cerr << "Error in 1:1 matching: " << e.what() << std::endl;
        result = MatchResult(); // Reset to default values
    }
    
    return result;
}

MatchResult FingerprintMatcher::match1toN(const std::string& probe_id) {
    MatchResult result;
    
    try {
        if (pImpl->enrolled_templates.empty()) {
            throw FingerprintMatcherException("No templates enrolled for matching");
        }
        
        // Find probe template
        auto probe_it = pImpl->findTemplate(probe_id);
        if (probe_it == pImpl->enrolled_templates.end()) {
            throw FingerprintMatcherException("Probe template not found: " + probe_id);
        }
        
        // Record start time
        auto start_time = std::chrono::high_resolution_clock::now();
        
        // Perform 1:N matching using OpenAFIS
        auto match_result = pImpl->matcher.oneMany(*probe_it, pImpl->enrolled_templates);
        
        // Record end time
        auto end_time = std::chrono::high_resolution_clock::now();
        
        // Fill result
        result.similarity_score = match_result.first;
        if (match_result.second != nullptr) {
            result.matched_template_id = match_result.second->id();
        }
        result.match_time = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time);
        result.is_match = (result.similarity_score >= pImpl->similarity_threshold);
        
    } catch (const std::exception& e) {
        std::cerr << "Error in 1:N matching: " << e.what() << std::endl;
        result = MatchResult(); // Reset to default values
    }
    
    return result;
}

MatchResult FingerprintMatcher::match1toNFromFile(const std::string& probe_file_path) {
    MatchResult result;
    
    try {
        if (pImpl->enrolled_templates.empty()) {
            throw FingerprintMatcherException("No templates enrolled for matching");
        }
        
        // Load probe template temporarily
        TemplateType probe_template("__temp_probe__");
        if (!probe_template.load(probe_file_path)) {
            throw FingerprintMatcherException("Failed to load probe template: " + probe_file_path);
        }
        
        if (probe_template.fingerprints().empty()) {
            throw FingerprintMatcherException("Probe template contains no fingerprints: " + probe_file_path);
        }
        
        // Record start time
        auto start_time = std::chrono::high_resolution_clock::now();
        
        // Perform 1:N matching using OpenAFIS
        auto match_result = pImpl->matcher.oneMany(probe_template, pImpl->enrolled_templates);
        
        // Record end time
        auto end_time = std::chrono::high_resolution_clock::now();
        
        // Fill result
        result.similarity_score = match_result.first;
        if (match_result.second != nullptr) {
            result.matched_template_id = match_result.second->id();
        }
        result.match_time = std::chrono::duration_cast<std::chrono::milliseconds>(end_time - start_time);
        result.is_match = (result.similarity_score >= pImpl->similarity_threshold);
        
    } catch (const std::exception& e) {
        std::cerr << "Error in 1:N matching with file: " << e.what() << std::endl;
        result = MatchResult(); // Reset to default values
    }
    
    return result;
}

size_t FingerprintMatcher::getEnrolledCount() const {
    return pImpl->enrolled_templates.size();
}

void FingerprintMatcher::clearTemplates() {
    pImpl->enrolled_templates.clear();
    std::cout << "All templates cleared" << std::endl;
}

void FingerprintMatcher::setSimilarityThreshold(uint8_t threshold) {
    pImpl->similarity_threshold = threshold;
    std::cout << "Similarity threshold set to: " << static_cast<int>(threshold) << std::endl;
}

uint8_t FingerprintMatcher::getSimilarityThreshold() const {
    return pImpl->similarity_threshold;
}

size_t FingerprintMatcher::getConcurrency() const {
    return pImpl->matcher.concurrency();
}

size_t FingerprintMatcher::getMemoryUsage() const {
    size_t total_bytes = 0;
    for (const auto& template_obj : pImpl->enrolled_templates) {
        total_bytes += template_obj.bytes();
    }
    return total_bytes;
}

} // namespace openafis
