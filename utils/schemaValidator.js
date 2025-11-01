// Validation options
const validationOptions = {
  // Pehle error per hi validation ko rok deta hai
  abortEarly: true,
  // Schema me unknown keys ko allow nh krta hai
  allowUnknown: false,
  // Schema me unknown keys ko remove krdeta hai
  stripUnknown: true,
};

// Schema validator function
const schemaValidator = (body, schema, useJoiError = true, customError) => {
  // Check kerta hai k schema provide hai k nh
  if (!schema) return ["Schema not found", null];

  // Schema par validation options ko use karke validate kerta hai
  const { error, value } = schema.validate(body, validationOptions);

  // Agar error hoti hai to
  if (error) {
    // Joi error object banata hai
    const joiError = {
      status: "failed", // Status failed set karta hai
      error: {
        original: error._original, // Original input data
        details: error.details.map(({ message, type }) => ({
          message: message.replace(/['"]/g, ""), // Message se quotes remove karta hai
          type, // Error type
        })),
      },
    };

    // Agar useJoiError true hai to Joi ka error message return kerta hai, warna custom error
    return [
      useJoiError ? joiError.error.details[0].message : customError,
      null,
    ];
  } else {
    // Agar validation successful hota hai to validated value return kerta hai
    return [null, value];
  }
};

// Function ko export kerta hai
module.exports = { schemaValidator };
