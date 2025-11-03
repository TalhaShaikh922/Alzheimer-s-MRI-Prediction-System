// Initialize Lucide icons when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Initialize page-specific functionality
    initializeTypewriter();
    initializeBackToTop();
    
    // Set active navigation link
    setActiveNavLink();
});

// Mobile Navigation Toggle
function toggleMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    const menuIcon = document.querySelector('.menu-icon');
    const closeIcon = document.querySelector('.close-icon');
    
    if (mobileNav.classList.contains('hidden')) {
        mobileNav.classList.remove('hidden');
        menuIcon.classList.add('hidden');
        closeIcon.classList.remove('hidden');
    } else {
        mobileNav.classList.add('hidden');
        menuIcon.classList.remove('hidden');
        closeIcon.classList.add('hidden');
    }
}

// Smooth scroll to main content
function scrollToMain() {
    const windowHeight = window.innerHeight;
    window.scrollTo({ 
        top: windowHeight, 
        behavior: 'smooth' 
    });
}

// Scroll to top functionality
function scrollToTop() {
    window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
    });
}

// Initialize back to top button
function initializeBackToTop() {
    const backToTopButton = document.getElementById('backToTop');
    
    if (backToTopButton) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.style.display = 'block';
            } else {
                backToTopButton.style.display = 'none';
            }
        });
    }
}

// Set active navigation link based on current page
function setActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const linkPath = new URL(link.href).pathname;
        
        if (currentPath === linkPath || 
            (currentPath === '/' && linkPath.includes('index.html')) ||
            (currentPath.includes('index.html') && linkPath === '/')) {
            link.classList.add('active');
        }
    });
}

// Typewriter effect for hero title
function initializeTypewriter() {
    const typewriterElement = document.getElementById('typewriter');
    if (typewriterElement) {
        const text = "Early Detection of Alzheimer's";
        let i = 0;
        
        typewriterElement.style.width = '0';
        typewriterElement.innerHTML = '';
        
        function typeWriter() {
            if (i < text.length) {
                typewriterElement.innerHTML += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            }
        }
        
        // Start typewriter effect after a short delay
        setTimeout(typeWriter, 500);
    }
}

// Text Analysis Functionality (Main Page)
let analysisProgress = 0;
let analysisInterval;

function analyzeText() {
    const textSample = document.getElementById('textSample');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const progressSection = document.getElementById('progressSection');
    const resultsSection = document.getElementById('resultsSection');
    const progressFill = document.getElementById('progressFill');
    
    if (!textSample || !textSample.value.trim()) {
        showToast('Please enter a text sample for analysis.', 'error');
        return;
    }
    
    // Reset and show progress
    analysisProgress = 0;
    progressSection.classList.remove('hidden');
    resultsSection.classList.add('hidden');
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i data-lucide="brain"></i> Analyzing...';
    
    // Re-initialize icons for the new button content
    lucide.createIcons();
    
    // Simulate analysis progress
    analysisInterval = setInterval(() => {
        analysisProgress += 10;
        progressFill.style.width = analysisProgress + '%';
        
        if (analysisProgress >= 100) {
            clearInterval(analysisInterval);
            completeAnalysis();
        }
    }, 300);
}

function completeAnalysis() {
    const progressSection = document.getElementById('progressSection');
    const resultsSection = document.getElementById('resultsSection');
    const analyzeBtn = document.getElementById('analyzeBtn');
    
    // Hide progress and show results
    progressSection.classList.add('hidden');
    resultsSection.classList.remove('hidden');
    
    // Reset button
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<i data-lucide="upload"></i> Analyze Text Sample';
    
    // Re-initialize icons
    lucide.createIcons();
    
    // Show success toast
    showToast('Analysis complete! Text sample has been successfully analyzed.', 'success');
}

// Feedback Form Submission
function submitFeedback(event) {
    event.preventDefault();
    
    const form = document.getElementById('feedbackForm');
    const formData = new FormData(form);
    const submitBtn = document.getElementById('submitBtn');
    
    // Validate required fields
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> Submitting...';
    
    // Simulate form submission
    setTimeout(() => {
        // Hide form and show success message
        document.getElementById('feedbackSection').classList.add('hidden');
        document.getElementById('successMessage').classList.remove('hidden');
        
        // Re-initialize icons
        lucide.createIcons();
        
        showToast('Feedback submitted successfully!', 'success');
    }, 2000);
}

// Reset feedback form
function resetForm() {
    const form = document.getElementById('feedbackForm');
    const submitBtn = document.getElementById('submitBtn');
    
    form.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i data-lucide="send"></i> Submit Feedback';
    
    document.getElementById('successMessage').classList.add('hidden');
    document.getElementById('feedbackSection').classList.remove('hidden');
    
    // Re-initialize icons
    lucide.createIcons();
}

// Contact Form Submission
function submitContact(event) {
    event.preventDefault();
    
    const form = document.getElementById('contactForm');
    const formData = new FormData(form);
    const submitBtn = document.getElementById('contactSubmitBtn');
    const contactSuccess = document.getElementById('contactSuccess');
    
    // Validate required fields
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    if (!name || !email || !message) {
        showToast('Please fill in all required fields.', 'error');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="spinner"></div> Sending...';
    
    // Simulate form submission
    setTimeout(() => {
        // Hide form and show success message
        form.classList.add('hidden');
        contactSuccess.classList.remove('hidden');
        
        // Re-initialize icons
        lucide.createIcons();
        
        showToast('Message sent successfully!', 'success');
    }, 2000);
}

// Reset contact form
function resetContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('contactSubmitBtn');
    const contactSuccess = document.getElementById('contactSuccess');
    
    form.reset();
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i data-lucide="send"></i> Send Message';
    
    form.classList.remove('hidden');
    contactSuccess.classList.add('hidden');
    
    // Re-initialize icons
    lucide.createIcons();
}

// Toast notification system
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            toast.style.background = 'hsl(142, 76%, 36%)';
            break;
        case 'error':
            toast.style.background = 'hsl(0, 84%, 60%)';
            break;
        default:
            toast.style.background = 'hsl(214, 100%, 55%)';
    }
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 4000);
}

// Intersection Observer for fade-in animations
function initializeAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe elements that should fade in
    const animatedElements = document.querySelectorAll('.feature-card, .process-step, .tech-card, .goal-card');
    animatedElements.forEach(el => observer.observe(el));
}

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', initializeAnimations);

// Handle form input focus states
document.addEventListener('DOMContentLoaded', function() {
    const inputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
    
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            this.parentElement.classList.remove('focused');
        });
    });
});

// Add spinner CSS for loading states
const spinnerCSS = `
    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid transparent;
        border-top: 2px solid currentColor;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        display: inline-block;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Add spinner styles to head
const style = document.createElement('style');
style.textContent = spinnerCSS;
document.head.appendChild(style);

// Close mobile menu when clicking on a link
document.addEventListener('DOMContentLoaded', function() {
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            const mobileNav = document.getElementById('mobileNav');
            const menuIcon = document.querySelector('.menu-icon');
            const closeIcon = document.querySelector('.close-icon');
            
            mobileNav.classList.add('hidden');
            menuIcon.classList.remove('hidden');
            closeIcon.classList.add('hidden');
        });
    });
});

// Smooth scrolling for anchor links
document.addEventListener('DOMContentLoaded', function() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});

// Enhanced error handling for form submissions
function handleFormError(error, formType) {
    console.error(`${formType} form error:`, error);
    showToast(`An error occurred while submitting your ${formType.toLowerCase()}. Please try again.`, 'error');
    
    // Reset form buttons
    const submitButtons = document.querySelectorAll('button[type="submit"]');
    submitButtons.forEach(btn => {
        btn.disabled = false;
        btn.innerHTML = btn.innerHTML.replace(/Submitting\.\.\.|Sending\.\.\./, 
            btn.id.includes('contact') ? 'Send Message' : 'Submit Feedback');
    });
}

// Progress bar utility function
function updateProgressBar(element, progress) {
    if (element) {
        element.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }
}

// Utility function to format text for display
function formatText(text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Local storage utilities for form data persistence
function saveFormData(formId, data) {
    try {
        localStorage.setItem(`form_${formId}`, JSON.stringify(data));
    } catch (error) {
        console.warn('Could not save form data:', error);
    }
}

function loadFormData(formId) {
    try {
        const data = localStorage.getItem(`form_${formId}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.warn('Could not load form data:', error);
        return null;
    }
}

function clearFormData(formId) {
    try {
        localStorage.removeItem(`form_${formId}`);
    } catch (error) {
        console.warn('Could not clear form data:', error);
    }
}

// Initialize form data persistence
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form[id]');
    
    forms.forEach(form => {
        const formId = form.id;
        const savedData = loadFormData(formId);
        
        // Load saved data
        if (savedData) {
            Object.keys(savedData).forEach(key => {
                const input = form.querySelector(`[name="${key}"]`);
                if (input && savedData[key]) {
                    input.value = savedData[key];
                }
            });
        }
        
        // Save data on input
        form.addEventListener('input', function() {
            const formData = new FormData(form);
            const data = {};
            
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            
            saveFormData(formId, data);
        });
        
        // Clear data on successful submission
        form.addEventListener('submit', function() {
            setTimeout(() => {
                clearFormData(formId);
            }, 3000); // Clear after 3 seconds
        });
    });
});