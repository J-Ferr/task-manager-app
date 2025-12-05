function validateTaskInput(title, description) {
    if (!title || title.trim() == "") {
        return "Title is required.";
    }

    if (description !== undefined && typeof description !== "string") {
        return "Description must be a string.";
    }

    return null; // no errors
}

module.exports = validateTaskInput;