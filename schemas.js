const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

// 1. DEFINE THE EXTENSION FIRST
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                // If the input is different from the sanitized output, it had HTML in it.
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

// 2. EXTEND JOI AFTER DEFINING THE EXTENSION
const Joi = BaseJoi.extend(extension);

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        // 3. APPLY THE RULE (.escapeHTML())
        title: Joi.string().required().escapeHTML(),
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML()
        // image is usually a URL, so we might skip strictly banning HTML characters if it breaks valid URLs, 
        // but generally safer to leave image validation to simple URL format checking.
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML() // Don't forget reviews!
    }).required()
});