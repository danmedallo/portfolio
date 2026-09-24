
        (function() {
            'use strict';

            // ── project data ──
            var projectsData = {
                'islandship': {
                    title: 'IslandShip — Ferry Schedule App',
                    icon: '⛴️',
                    iconBg: '#eff6ff',
                    description: 'Ferry schedules for RORO routes between Cebu, Bantayan Island, Masbate and Negros, built with Laravel, Inertia.js and React. It installs to a phone as a progressive web app and keeps working without a signal: a service worker serves the pages already opened, which matters at piers where coverage drops. Booking is deliberately left online-only, since seats are confirmed live. The timetable refreshes itself weekly from the source timetable API, guarded so a repeated run cannot overwrite good data, and the whole thing ships as a Docker image on Render with Postgres.',
                    tags: ['Laravel', 'React', 'Inertia.js', 'PWA', 'Service Worker', 'PostgreSQL', 'Docker', 'Render'],
                    demo: 'https://islandhip-q6tq.onrender.com',
                    github: 'https://github.com/danmedallo/Islandhip'
                },
                'tasky-cli': {
                    title: 'tasky-cli — CLI Todo App',
                    icon: '⌨️',
                    iconBg: '#fff7ed',
                    description: 'An open-source command-line task manager published to npm. Add, list, edit, complete, and delete tasks without leaving the terminal — supports batch operations and local JSON persistence.',
                    tags: ['Node.js', 'npm', 'CLI'],
                    demo: 'https://www.npmjs.com/package/tasky-cli',
                    demoLabel: 'View on npm',
                    github: 'https://github.com/dan-medalllojr/tasky-cli'
                }
            };

            // ── DOM refs ──
            var modal = document.getElementById('projectModal');
            var modalClose = document.getElementById('modalClose');
            var modalIcon = document.getElementById('modalIcon');
            var modalTitle = document.getElementById('modalTitle');
            var modalDesc = document.getElementById('modalDesc');
            var modalTags = document.getElementById('modalTags');
            var modalActions = document.getElementById('modalActions');

            // ── open modal ──
            function openModal(projectId) {
                var data = projectsData[projectId];
                if (!data) return;

                modalIcon.textContent = data.icon;
                modalIcon.style.background = data.iconBg;
                modalTitle.textContent = data.title;
                modalDesc.textContent = data.description;

                // tags
                modalTags.innerHTML = '';
                data.tags.forEach(function(tag) {
                    var span = document.createElement('span');
                    span.className = 'tag';
                    span.textContent = tag;
                    modalTags.appendChild(span);
                });

                // actions
                modalActions.innerHTML = '';
                if (data.demo) {
                    var demoBtn = document.createElement('a');
                    demoBtn.className = 'btn-primary';
                    demoBtn.href = data.demo;
                    demoBtn.target = '_blank';
                    demoBtn.rel = 'noopener';
                    demoBtn.textContent = data.demoLabel || 'Live Demo';
                    modalActions.appendChild(demoBtn);
                }
                if (data.github) {
                    var githubBtn = document.createElement('a');
                    githubBtn.className = 'btn-secondary';
                    githubBtn.href = data.github;
                    githubBtn.target = '_blank';
                    githubBtn.rel = 'noopener';
                    githubBtn.textContent = 'View Code';
                    modalActions.appendChild(githubBtn);
                }

                // show modal
                modal.classList.add('open');
                document.body.style.overflow = 'hidden';
                // focus management
                setTimeout(function() { modalClose.focus(); }, 100);
            }

            // ── close modal ──
            function closeModal() {
                modal.classList.remove('open');
                document.body.style.overflow = '';
                // return focus to last focused card (optional)
            }

            // ── event listeners ──
            // click on project cards (excluding add-card)
            document.querySelectorAll('.project-card[data-project-id]').forEach(function(card) {
                card.addEventListener('click', function(e) {
                    // let a real link inside the card do its own thing
                    if (e.target.closest('a')) return;
                    var id = this.getAttribute('data-project-id');
                    if (id) openModal(id);
                });
            });

            modalClose.addEventListener('click', closeModal);

            // close on overlay click
            modal.addEventListener('click', function(e) {
                if (e.target === this) closeModal();
            });

            // close on Escape
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && modal.classList.contains('open')) {
                    closeModal();
                }
            });

            // ── hamburger ──
            var hamburger = document.getElementById('hamburger');
            var drawer = document.getElementById('mobileDrawer');

            function toggleMenu(open) {
                var isOpen = typeof open === 'boolean' ? open : !hamburger.classList.contains('open');
                hamburger.classList.toggle('open', isOpen);
                drawer.classList.toggle('open', isOpen);
                hamburger.setAttribute('aria-expanded', isOpen);
                document.body.style.overflow = isOpen ? 'hidden' : '';
            }

            hamburger.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleMenu();
            });

            document.querySelectorAll('.mob-link').forEach(function(a) {
                a.addEventListener('click', function() {
                    toggleMenu(false);
                });
            });

            document.addEventListener('click', function(e) {
                if (drawer.classList.contains('open') &&
                    !drawer.contains(e.target) &&
                    !hamburger.contains(e.target)) {
                    toggleMenu(false);
                }
            });

            document.addEventListener('keydown', function(e) {
                if (e.key === 'Escape' && drawer.classList.contains('open')) {
                    toggleMenu(false);
                    hamburger.focus();
                }
            });

            // ── smooth scroll ──
            function scrollToTarget(target) {
                var el = document.querySelector(target);
                if (el) {
                    var navHeight = document.getElementById('mainNav').offsetHeight || 56;
                    var top = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 8;
                    window.scrollTo({ top: top, behavior: 'smooth' });
                }
            }

            document.querySelectorAll('a[href^="#"]').forEach(function(a) {
                a.addEventListener('click', function(e) {
                    var target = this.getAttribute('href');
                    if (target && target !== '#') {
                        e.preventDefault();
                        scrollToTarget(target);
                        if (drawer.classList.contains('open')) toggleMenu(false);
                    }
                });
            });

            document.querySelectorAll('[data-scroll]').forEach(function(el) {
                el.addEventListener('click', function(e) {
                    var target = this.getAttribute('data-scroll');
                    if (target) {
                        e.preventDefault();
                        scrollToTarget(target);
                        if (drawer.classList.contains('open')) toggleMenu(false);
                    }
                });
            });

            // ── nav shadow ──
            var nav = document.getElementById('mainNav');
            var scrolled = false;
            window.addEventListener('scroll', function() {
                var now = window.pageYOffset > 10;
                if (now !== scrolled) {
                    scrolled = now;
                    nav.classList.toggle('scrolled', scrolled);
                }
            }, { passive: true });

            // ── contact form ──
            var submitBtn = document.getElementById('submitBtn');
            var formMsg = document.getElementById('form-msg');
            var formInputs = document.querySelectorAll('#contactForm .form-input, #contactForm .form-textarea');

            function clearErrors() {
                formInputs.forEach(function(i) { i.classList.remove('error'); });
            }

            submitBtn.addEventListener('click', function() {
                clearErrors();
                var ok = true;
                var required = document.querySelectorAll('#contactForm [required]');
                required.forEach(function(i) {
                    if (!i.value.trim()) {
                        ok = false;
                        i.classList.add('error');
                    }
                });
                var email = document.getElementById('formEmail');
                if (email.value.trim() && !/^\S+@\S+\.\S+$/.test(email.value.trim())) {
                    ok = false;
                    email.classList.add('error');
                }

                if (!ok) {
                    var firstErr = document.querySelector('#contactForm .error');
                    if (firstErr) {
                        firstErr.focus();
                        setTimeout(function() {
                            firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }, 100);
                    }
                    return;
                }

                submitBtn.textContent = 'Sending…';
                submitBtn.disabled = true;

                setTimeout(function() {
                    formInputs.forEach(function(i) { i.value = ''; });
                    submitBtn.textContent = 'Send message';
                    submitBtn.disabled = false;
                    formMsg.style.display = 'block';
                    clearErrors();
                    setTimeout(function() {
                        formMsg.style.display = 'none';
                    }, 4000);
                }, 1200);
            });

            document.querySelectorAll('#contactForm .form-input, #contactForm .form-textarea').forEach(function(i) {
                i.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' && this.tagName !== 'TEXTAREA') {
                        e.preventDefault();
                        submitBtn.click();
                    }
                });
            });

            // ── project count: only the projects shown on the page ──
            var projectCount = document.getElementById('projectCount');
            if (projectCount) {
                projectCount.textContent = document.querySelectorAll('.project-card[data-project-id]').length;
            }

            // ── add card keyboard ──
            var addCard = document.querySelector('.project-card.add-card');
            if (addCard) {
                addCard.addEventListener('keydown', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.click();
                    }
                });
            }

        })();