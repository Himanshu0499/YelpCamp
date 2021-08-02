//requieing Joi pacakge
// For server side validation.
const sanitizeHTML = require('sanitize-html');
const baseJoi = require('joi');

// defining an extension on joi.string called escapeHTML, so that HTML will not be escaped on the string properties.
const extension = (joi) => ({                                          
    type: 'string',     
    base :joi.string(),
    messages : {
        'string.escapeHTML' : '{{#label}} must not include HTML'        
        // setting an error message for escapeHTML on string(string.escapeHTML)
        // {{#label}} will include value on which the escapeHTML function is called
    },
    rules: {
        escapeHTML : {                                  //escapeHTML method 
            validate(value, helpers){                   // JOI will automatically call the validate function with the value 
                const clean = sanitizeHTML(value, {     // stanitizeHTML package is used to sanitize(remove) HTML from the value 
                    allowedTags : [],                   // we can allow specific tags like h1. In this case ,we are not allowing any tags or attributes
                    allowedAttributes : {}
                });
                // if the value received and sanitized value is not same then we return error with message specified above
                if(clean !== value) return helpers.error('string.escapeHTML', {value});         
                return clean;
            }
        }
    }
})

const Joi = baseJoi.extend(extension)           // telling joi to use this extension.

module.exports.campgroundSchema = Joi.object({
    campground : Joi.object({
        title : Joi.string().required().messages({'string.empty' : 'Campground title cannot be empty'}).escapeHTML(),
        price : Joi.number().required().min(0).messages({'number.base' : 'Price should be a number'}),
        //images : Joi.string().required(),
        description : Joi.string().required().messages({'string.empty' : 'Campground description cannot be empty'}).escapeHTML(),
        location : Joi.string().required().messages({'string.empty' : 'Campground location cannot be empty'}).escapeHTML(),
    }).required(),
    deleteImage : Joi.array()
})

module.exports.reviewSchema = Joi.object({
    review : Joi.object({
        body : Joi.string().required().escapeHTML(),
        rating : Joi.number().required().min(0).max(5)
    }).required()
})