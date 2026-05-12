// Initialize Page Logic
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initParallax();
    initNewsletter();
    initModal();
    initSchoolModal();
    loadSchools();
    loadStories();
});

// Navbar Interaction
function initNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Modal Logic
function initModal() {
    const modal = document.getElementById('video-modal');
    const watchBtn = document.querySelector('a[href="#discover"].btn-outline');
    const closeBtn = document.querySelector('.close-modal');

    if (!modal || !watchBtn || !closeBtn) return;

    watchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Automatic playback on open
        setTimeout(() => {
            startPlayback();
        }, 500); // Small delay for smooth transition
    });

    const videoContainer = document.getElementById('aura-video-player');
    const startOverlay = document.getElementById('start-video-overlay');
    const progress = document.getElementById('video-progress');
    const captionText = document.getElementById('video-caption-text');
    const frames = videoContainer.querySelectorAll('.video-frame');
    let progressInterval;
    let frameInterval;
    let currentFrame = 0;

    if (!videoContainer) return;

    const startPlayback = () => {
        console.log('Starting AI Journey...');
        videoContainer.classList.add('playing');
        let width = 0;
        currentFrame = 0;
        
        // Reset frames
        frames.forEach(f => f.classList.remove('active'));
        if (frames[0]) {
            frames[0].classList.add('active');
            if (captionText) captionText.textContent = frames[0].dataset.caption;
        }

        clearInterval(progressInterval);
        clearInterval(frameInterval);

        progressInterval = setInterval(() => {
            if (width >= 100) {
                width = 0; // Loop progress
            } else {
                width += 0.05;
                if (progress) progress.style.width = width + '%';
            }
        }, 30);

        frameInterval = setInterval(() => {
            if (frames.length > 0) {
                frames[currentFrame].classList.remove('active');
                currentFrame = (currentFrame + 1) % frames.length;
                frames[currentFrame].classList.add('active');
                if (captionText) captionText.textContent = frames[currentFrame].dataset.caption;
            }
        }, 5000);
    };

    const stopPlayback = () => {
        videoContainer.classList.remove('playing');
        clearInterval(progressInterval);
        clearInterval(frameInterval);
        if (progress) progress.style.width = '0%';
        frames.forEach(f => f.classList.remove('active'));
        if (frames[0]) frames[0].classList.add('active');
    };

    // Make the entire container clickable once playing to stop
    videoContainer.addEventListener('click', () => {
        if (videoContainer.classList.contains('playing')) {
            stopPlayback();
        }
    });

    if (startOverlay) {
        startOverlay.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent container click from triggering
            startPlayback();
        });
    }

    const closeModal = () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
        stopPlayback();
    };

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // ESC to close
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });
}

// School Details Modal Logic
let allSchools = [];

function initSchoolModal() {
    const modal = document.getElementById('school-modal');
    
    document.addEventListener('click', (e) => {
        if (e.target.closest('.close-btn-minimal') || e.target.closest('.close-btn-classic') || e.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

function showSchoolDetails(schoolName) {
    const school = allSchools.find(s => s.name === schoolName);
    if (!school) return;

    const modal = document.getElementById('school-modal');
    const content = document.getElementById('school-details-content');
    
    content.innerHTML = `
        <div class="close-btn-minimal">
            <i data-lucide="x" size="32"></i>
        </div>
        
        <div class="details-visual-pane">
            <img src="${school.image.replace('w=2000', 'w=1200')}" alt="${school.name}" 
                 onerror="this.src='https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=1200'">
            <div class="visual-overlay"></div>
            <div class="visual-content">
                <span class="section-tag" style="background: var(--primary); color: #fff; padding: 0.5rem 1.5rem; border-radius: 2px; font-weight: 700; margin-bottom: 2rem; display: inline-block;">${school.type}</span>
                <h2>${school.name}</h2>
                <div class="visual-meta">
                    <span>${school.location}</span>
                    <span>Est. ${school.established}</span>
                </div>
            </div>
        </div>
        
        <div class="details-info-pane">
            <div class="content-block">
                <span class="section-label">Philosophy</span>
                <h3>Defining Excellence</h3>
                <p>${school.extraData}</p>
                <p style="margin-top: 2rem;">${school.description}</p>
            </div>
            
            <div class="content-block">
                <span class="section-label">Institutional Leadership</span>
                <div style="display: flex; align-items: center; gap: 2rem;">
                    <div class="principal-avatar">
                        <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(school.principal)}&background=6366f1&color=fff&size=128" alt="${school.principal}">
                    </div>
                    <div>
                        <h4 style="font-size: 1.4rem; margin: 0;">${school.principal}</h4>
                        <span style="color: var(--text-secondary); font-size: 0.9rem; text-transform: uppercase; letter-spacing: 2px;">Principal</span>
                    </div>
                </div>
            </div>

            <div class="content-block">
                <span class="section-label">Statistics</span>
                <div class="stat-list">
                    <div class="stat-entry">
                        <div class="stat-icon-wrap"><i data-lucide="maximize"></i></div>
                        <div class="stat-text">
                            <span class="stat-key">Campus Area</span>
                            <span class="stat-val">${school.area}</span>
                        </div>
                    </div>
                    <div class="stat-entry">
                        <div class="stat-icon-wrap"><i data-lucide="credit-card"></i></div>
                        <div class="stat-text">
                            <span class="stat-key">Annual Fees</span>
                            <span class="stat-val">${school.fees}</span>
                        </div>
                    </div>
                    <div class="stat-entry">
                        <div class="stat-icon-wrap"><i data-lucide="users"></i></div>
                        <div class="stat-text">
                            <span class="stat-key">Faculty Members</span>
                            <span class="stat-val">${school.faculties}+ Experts</span>
                        </div>
                    </div>
                    <div class="stat-entry">
                        <div class="stat-icon-wrap"><i data-lucide="graduation-cap"></i></div>
                        <div class="stat-text">
                            <span class="stat-key">Student Enrollment</span>
                            <span class="stat-val">${school.totalStudents} Global Leaders</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-block">
                <span class="section-label">Location</span>
                <div class="minimal-map">
                    <iframe src="https://maps.google.com/maps?q=${encodeURIComponent(school.name + ' ' + school.location)}&output=embed" allowfullscreen="" loading="lazy" title="Location Map"></iframe>
                </div>
                <div style="margin-top: 1rem; text-align: right;">
                    <a href="https://www.google.com/maps/search/${encodeURIComponent(school.name + ' ' + school.location)}" target="_blank" style="color: var(--primary); font-size: 0.8rem; text-decoration: none; font-weight: 700; letter-spacing: 1px;">OPEN IN GOOGLE MAPS ↗</a>
                </div>
            </div>

            <div class="prospectus-section" style="margin-top: 4rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.05);">
                <div class="prospectus-capture" style="padding: 2rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); background: rgba(255,255,255,0.01);">
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                        <i data-lucide="mail-plus" style="color: var(--primary); width: 24px;"></i>
                        <h4 style="font-size: 1.1rem; font-weight: 700; letter-spacing: 1px;">Request Digital Prospectus</h4>
                    </div>
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 2rem; line-height: 1.6;">Get a comprehensive institutional dossier including fee structure, curriculum details, and faculty profiles dispatched to your inbox.</p>
                    
                    <div id="prospectus-form-wrap" style="display: flex; gap: 0.8rem; width: 100%; flex-wrap: wrap;">
                        <input type="email" id="prospectus-email" name="email" class="prospectus-email-input" placeholder="Enter your email" autocomplete="email" style="flex: 1; min-width: 200px; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); padding: 1rem 1.5rem; border-radius: 100px; color: #fff; font-size: 0.9rem;">
                        <button id="send-prospectus-btn" class="btn-send-prospectus" style="background: var(--primary); border: none; padding: 0 2rem; border-radius: 100px; color: #fff; font-weight: 800; cursor: pointer; min-width: 120px; letter-spacing: 1px; transition: all 0.3s ease;">SEND</button>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 2rem;">
                <a href="${school.website || 'https://www.google.com/search?q=' + encodeURIComponent(school.name + ' admission')}" target="_blank" class="btn btn-main" style="width: 100%; padding: 1.5rem; font-weight: 800; letter-spacing: 4px; text-transform: uppercase; text-decoration: none; display: block; text-align: center;">Apply for Admission</a>
                <p style="text-align: center; margin-top: 1.5rem; color: var(--text-secondary); font-size: 0.8rem; letter-spacing: 1px;">&copy; 2026 AURA INSTITUTIONAL PARTNERS</p>
            </div>
        </div>
    `;

    // Add event listener to the prospectus button to avoid syntax errors with quotes in school names
    const sendBtn = document.getElementById('send-prospectus-btn');
    if (sendBtn) {
        sendBtn.addEventListener('click', () => window.handleProspectusRequest(school.name, sendBtn));
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    lucide.createIcons();
}

window.handleProspectusRequest = async function(schoolName, button) {
    const input = document.getElementById('prospectus-email');
    const email = input.value;
    const school = allSchools.find(s => s.name === schoolName);
    
    if (!email || !email.includes('@')) {
        alert('Please enter a valid premium email address.');
        return;
    }

    if (!school) return;

    button.disabled = true;
    button.classList.add('loading');
    button.textContent = 'DISPATCHING...';
    input.disabled = true;
    input.style.opacity = '0.5';

    // Prepare full institutional details for the email
    const emailData = {
        email: email,
        subject: `[AURA] Institutional Dossier: ${school.name}`,
        message: `
            INSTITUTIONAL DOSSIER - AURA SIGNATURE SERIES
            -------------------------------------------
            School: ${school.name}
            Location: ${school.location}
            Established: ${school.established}
            Type: ${school.type}
            
            ACADEMIC PROFILE
            ----------------
            Faculties: ${school.faculties}
            Total Students: ${school.totalStudents}
            Total Subjects: ${school.totalSubjects}
            
            CAMPUS & FINANCE
            ----------------
            Area: ${school.area}
            Annual Fees: ${school.fees}
            
            PRINCIPAL'S OFFICE
            ------------------
            Leadership: ${school.principal}
            
            OVERVIEW
            --------
            ${school.description}
            
            ADDITIONAL INSIGHTS
            -------------------
            ${school.extraData}
            
            DISPATCHED BY AURA | PREMIUM INSTITUTIONAL INTELLIGENCE
        `
    };

    try {
        const response = await fetch('http://localhost:5000/api/prospectus', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: emailData.email,
                schoolName: school.name,
                message: emailData.message
            })
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Dispatch failed');
        }

        const wrap = document.getElementById('prospectus-form-wrap');
        wrap.innerHTML = `
            <div style="width: 100%; text-align: center; padding: 1.5rem; background: rgba(16, 185, 129, 0.1); border-radius: 100px; border: 1px solid rgba(16, 185, 129, 0.3); color: #10b981; font-weight: 700; animation: premiumPop 0.5s ease;">
                Full Institutional Dossier Dispatched to ${email} ✓
            </div>
        `;
        
        console.log('AURA Intelligence Dispatched:', emailData);

    } catch (error) {
        console.error('Dispatch Error:', error);
        alert(error.message || 'Error dispatching dossier. Please try again.');
        button.textContent = 'ERROR - RETRY';
        button.disabled = false;
        input.disabled = false;
        input.style.opacity = '1';
    }
}

// Background Parallax Logic
function initParallax() {
    const orbs = document.querySelectorAll('.glow-orb');
    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 50;
        const y = (clientY / window.innerHeight - 0.5) * 50;

        orbs.forEach((orb, index) => {
            const factor = (index + 1) * 0.5;
            orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
        });
    });
}

// Newsletter & Lead Capture Logic
function initNewsletter() {
    const form = document.getElementById('subscribe-form');
    const successDiv = document.getElementById('sub-success');
    if (!form || !successDiv) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const button = form.querySelector('button');
        const input = form.querySelector('input');
        const email = input.value;

        button.disabled = true;
        button.style.width = button.offsetWidth + 'px'; // Maintain width
        button.textContent = 'DISPATCHING...';
        input.style.opacity = '0.5';

        try {
            const response = await fetch('http://localhost:5000/api/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Subscription failed');
            }

            form.style.display = 'none';
            successDiv.style.display = 'block';
            
            // Dynamic success message
            const successMsg = document.getElementById('success-msg');
            if (successMsg) {
                successMsg.textContent = `The AURA Institutional Dossier and your exclusive 'Inner Circle' invitation have been successfully dispatched to ${email}. Check your inbox to begin your journey.`;
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert(error.message || 'Error subscribing. Please try again.');
            button.disabled = false;
            button.textContent = 'SUBSCRIBE';
            input.style.opacity = '1';
        }
        
        lucide.createIcons();
    });
}



async function loadSchools() {
    const grid = document.getElementById('school-grid');
    const searchInput = document.getElementById('school-search');
    const typeFilter = document.getElementById('type-filter');
    if (!grid) return;
    
    try {
        const response = await fetch('./schools.json');
        allSchools = await response.json();
        
        const renderSchools = (filteredSchools) => {
            grid.innerHTML = filteredSchools.map((school, index) => `
                <article class="glass-card school-card" data-name="${school.name}" data-reveal style="transition-delay: ${index * 0.05}s; cursor: pointer;">
                    <img src="${school.image}" alt="${school.name} campus" class="card-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=800'">
                    <div class="card-content">
                        <h3>${school.name}</h3>
                        <p>${school.description.substring(0, 100)}...</p>
                        <div class="card-meta">
                            <span class="badge">${school.location}</span>
                            <span class="badge" style="border-color: var(--primary); color: var(--primary)">${school.type}</span>
                        </div>
                    </div>
                </article>
            `).join('');
            
            // Add click listeners to cards
            document.querySelectorAll('.school-card').forEach(card => {
                card.addEventListener('click', () => {
                    showSchoolDetails(card.dataset.name);
                });
            });

            initScrollReveal();
        };

        const filterSchools = () => {
            const query = searchInput.value.toLowerCase();
            const type = typeFilter.value;
            
            const filtered = allSchools.filter(school => {
                const matchesSearch = school.name.toLowerCase().includes(query) || 
                                     school.location.toLowerCase().includes(query);
                const matchesType = type === 'all' || school.type === type;
                return matchesSearch && matchesType;
            });
            
            renderSchools(filtered);
        };

        searchInput?.addEventListener('input', filterSchools);
        typeFilter?.addEventListener('change', filterSchools);
        
        renderSchools(allSchools);

    } catch (error) {
        console.error('Error loading schools:', error);
        grid.innerHTML = '<p>Failed to load schools.</p>';
    }
}

async function loadStories() {
    const grid = document.getElementById('stories-grid');
    if (!grid) return;

    try {
        const response = await fetch('./stories.json');
        const stories = await response.json();

        grid.innerHTML = stories.map((story, index) => `
            <article class="story-card" data-reveal style="transition-delay: ${index * 0.1}s">
                <div class="story-img-wrapper">
                    <img src="${story.image}" alt="${story.title}" class="story-img" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=800'">
                </div>
                <div class="story-content">
                    <span class="story-category">${story.category}</span>
                    <h3>${story.title}</h3>
                    <p class="story-excerpt">${story.excerpt}</p>
                    <div class="story-meta">
                        <span>AURA EDITORIAL</span>
                        <span>${story.date}</span>
                    </div>
                </div>
            </article>
        `).join('');

        initScrollReveal();
    } catch (error) {
        console.error('Error loading stories:', error);
    }
}

function initScrollReveal() {
    const revealElements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));
}

window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});
