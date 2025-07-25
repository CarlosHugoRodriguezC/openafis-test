#ifndef FINGERPRINT_MATCHER_H
#define FINGERPRINT_MATCHER_H

#include "OpenAFIS.h"
#include <string>
#include <vector>
#include <memory>
#include <chrono>

namespace openafis {

/**
 * @brief Result of a fingerprint matching operation
 */
struct MatchResult {
    uint8_t similarity_score;     // Similarity score (0-255)
    std::string matched_template_id;  // ID of matched template
    std::chrono::milliseconds match_time;  // Time taken for matching
    bool is_match;               // Whether this is considered a match
    
    MatchResult() : similarity_score(0), matched_template_id(""), match_time(0), is_match(false) {}
};

/**
 * @brief Hardware-independent fingerprint matcher using OpenAfis
 */
class FingerprintMatcher {
public:
    /**
     * @brief Construct a new Fingerprint Matcher
     * @param similarity_threshold Minimum similarity score for a match (default: 40)
     */
    explicit FingerprintMatcher(uint8_t similarity_threshold = 40);
    
    /**
     * @brief Destroy the Fingerprint Matcher
     */
    ~FingerprintMatcher();
    
    /**
     * @brief Load a fingerprint template from an ISO 19794-2 file
     * @param template_id Unique identifier for this template
     * @param file_path Path to the ISO template file
     * @return true if loading was successful
     */
    bool loadTemplate(const std::string& template_id, const std::string& file_path);
    
    /**
     * @brief Load a fingerprint template from raw data
     * @param template_id Unique identifier for this template
     * @param data Raw template data
     * @param length Size of the data
     * @return true if loading was successful
     */
    bool loadTemplate(const std::string& template_id, const uint8_t* data, size_t length);
    
    /**
     * @brief Perform 1:1 matching between two specific templates
     * @param probe_id ID of the probe template
     * @param candidate_id ID of the candidate template
     * @return MatchResult with similarity score and timing
     */
    MatchResult match1to1(const std::string& probe_id, const std::string& candidate_id);
    
    /**
     * @brief Perform 1:N matching of probe against all enrolled templates
     * @param probe_id ID of the probe template
     * @return MatchResult with best match information
     */
    MatchResult match1toN(const std::string& probe_id);
    
    /**
     * @brief Perform 1:N matching with probe loaded from file
     * @param probe_file_path Path to probe template file
     * @return MatchResult with best match information
     */
    MatchResult match1toNFromFile(const std::string& probe_file_path);
    
    /**
     * @brief Get number of enrolled templates
     * @return Number of templates currently loaded
     */
    size_t getEnrolledCount() const;
    
    /**
     * @brief Clear all enrolled templates
     */
    void clearTemplates();
    
    /**
     * @brief Set similarity threshold for matching
     * @param threshold New threshold value (0-255)
     */
    void setSimilarityThreshold(uint8_t threshold);
    
    /**
     * @brief Get current similarity threshold
     * @return Current threshold value
     */
    uint8_t getSimilarityThreshold() const;
    
    /**
     * @brief Get concurrency level (number of threads used)
     * @return Number of threads
     */
    size_t getConcurrency() const;
    
    /**
     * @brief Get memory usage statistics
     * @return Memory usage in bytes
     */
    size_t getMemoryUsage() const;

private:
    // Forward declarations for PIMPL pattern
    class Impl;
    std::unique_ptr<Impl> pImpl;
};

/**
 * @brief Exception class for fingerprint matching errors
 */
class FingerprintMatcherException : public std::exception {
public:
    explicit FingerprintMatcherException(const std::string& message) : msg_(message) {}
    const char* what() const noexcept override { return msg_.c_str(); }
    
private:
    std::string msg_;
};

} // namespace openafis

#endif // FINGERPRINT_MATCHER_H
