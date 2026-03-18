/**
 * ContactForm Component
 * Handles contact form validation, submission, and pre-filling
 */
class ContactForm {
    constructor(formElement) {
        this.form = formElement;
        this.nameInput = formElement.querySelector('#contact-name');
        this.emailInput = formElement.querySelector('#contact-email');
        this.subjectInput = formElement.querySelector('#contact-subject');
        this.messageInput = formElement.querySelector('#contact-message');
        
        this.nameError = formElement.querySelector('#name-error');
        this.emailError = formElement.querySelector('#email-error');
        this.subjectError = formElement.querySelector('#subject-error');
        this.messageError = formElement.querySelector('#message-error');
        
        this.successMessage = formElement.querySelector('#form-success');
        this.submitButton = formElement.querySelector('.submit-button');
        
        this.init();
    }

    init() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation on blur
        this.nameInput.addEventListener('blur', () => this.validateName());
        this.emailInput.addEventListener('blur', () => this.validateEmail());
        this.subjectInput.addEventListener('blur', () => this.validateSubject());
        this.messageInput.addEventListener('blur', () => this.validateMessage());
        
        // Clear error on input
        this.nameInput.addEventListener('input', () => this.clearError(this.nameInput, this.nameError));
        this.emailInput.addEventListener('input', () => this.clearError(this.emailInput, this.emailError));
        this.subjectInput.addEventListener('input', () => this.clearError(this.subjectInput, this.subjectError));
        this.messageInput.addEventListener('input', () => this.clearError(this.messageInput, this.messageError));
        
        // Check for pre-fill from URL parameters
        this.checkUrlParameters();
    }

    /**
     * Check URL parameters for pre-filling the subject field
     */
    checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const productName = urlParams.get('product');
        
        if (productName) {
            this.prefillSubject(productName);
        }
    }

    /**
     * Pre-fill the subject field with product name
     * @param {string} productName - The name of the product
     */
    prefillSubject(productName) {
        if (productName && this.subjectInput) {
            this.subjectInput.value = `Inquiry about ${productName}`;
        }
    }

    /**
     * Validate name field
     * @returns {boolean} - True if valid
     */
    validateName() {
        const name = this.nameInput.value.trim();
        
        if (!name) {
            this.showError(this.nameInput, this.nameError, 'Please enter your name');
            return false;
        }
        
        if (name.length > 100) {
            this.showError(this.nameInput, this.nameError, 'Name must be 100 characters or less');
            return false;
        }
        
        this.clearError(this.nameInput, this.nameError);
        return true;
    }

    /**
     * Validate email field
     * @returns {boolean} - True if valid
     */
    validateEmail() {
        const email = this.emailInput.value.trim();
        
        if (!email) {
            this.showError(this.emailInput, this.emailError, 'Please enter your email address');
            return false;
        }
        
        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showError(this.emailInput, this.emailError, 'Please enter a valid email address (e.g., name@example.com)');
            return false;
        }
        
        this.clearError(this.emailInput, this.emailError);
        return true;
    }

    /**
     * Validate subject field
     * @returns {boolean} - True if valid
     */
    validateSubject() {
        const subject = this.subjectInput.value.trim();
        
        if (!subject) {
            this.showError(this.subjectInput, this.subjectError, 'Please enter a subject');
            return false;
        }
        
        if (subject.length > 200) {
            this.showError(this.subjectInput, this.subjectError, 'Subject must be 200 characters or less');
            return false;
        }
        
        this.clearError(this.subjectInput, this.subjectError);
        return true;
    }

    /**
     * Validate message field
     * @returns {boolean} - True if valid
     */
    validateMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message) {
            this.showError(this.messageInput, this.messageError, 'Please enter a message');
            return false;
        }
        
        if (message.length > 2000) {
            this.showError(this.messageInput, this.messageError, 'Message must be 2000 characters or less');
            return false;
        }
        
        this.clearError(this.messageInput, this.messageError);
        return true;
    }

    /**
     * Validate entire form
     * @returns {boolean} - True if all fields are valid
     */
    validate() {
        const isNameValid = this.validateName();
        const isEmailValid = this.validateEmail();
        const isSubjectValid = this.validateSubject();
        const isMessageValid = this.validateMessage();
        
        return isNameValid && isEmailValid && isSubjectValid && isMessageValid;
    }

    /**
     * Show error message for a field
     * @param {HTMLElement} input - The input element
     * @param {HTMLElement} errorElement - The error message element
     * @param {string} message - The error message
     */
    showError(input, errorElement, message) {
        input.classList.add('error');
        errorElement.textContent = message;
        errorElement.classList.add('visible');
        errorElement.style.display = 'block';
    }

    /**
     * Clear error message for a field
     * @param {HTMLElement} input - The input element
     * @param {HTMLElement} errorElement - The error message element
     */
    clearError(input, errorElement) {
        input.classList.remove('error');
        errorElement.textContent = '';
        errorElement.classList.remove('visible');
        errorElement.style.display = 'none';
    }

    /**
     * Handle form submission
     * @param {Event} e - The submit event
     */
    handleSubmit(e) {
        e.preventDefault();
        
        // Hide success message if visible
        this.successMessage.style.display = 'none';
        
        // Validate form
        if (!this.validate()) {
            return;
        }
        
        // Disable submit button
        this.submitButton.disabled = true;
        this.submitButton.textContent = 'Sending...';
        
        // Simulate form submission (in a real app, this would send to a server)
        this.submit();
    }

    /**
     * Submit the form
     * In a static site, this would typically integrate with a service like Formspree or Netlify Forms
     */
    submit() {
        // Get form data
        const formData = {
            name: this.nameInput.value.trim(),
            email: this.emailInput.value.trim(),
            subject: this.subjectInput.value.trim(),
            message: this.messageInput.value.trim(),
            timestamp: new Date().toISOString()
        };
        
        // Log form data (in production, this would be sent to a server or service)
        console.log('Form submitted:', formData);
        
        // Simulate network delay
        setTimeout(() => {
            // Show success message
            this.successMessage.style.display = 'block';
            
            // Reset form
            this.form.reset();
            
            // Re-enable submit button
            this.submitButton.disabled = false;
            this.submitButton.textContent = 'Send Message';
            
            // Scroll to success message
            this.successMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 1000);
    }
}

// Initialize contact form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        new ContactForm(contactForm);
    }
});
