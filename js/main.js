document.addEventListener('DOMContentLoaded', function () {
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '' && segment !== 'index.html');
        let relativePathToRoot = '';
        const currentPathParts = window.location.pathname.split('/').filter(Boolean);
        if (currentPathParts.length > 0 && currentPathParts[currentPathParts.length - 1].includes('.')) {
            currentPathParts.pop();
        }
        relativePathToRoot = '../'.repeat(currentPathParts.length);
        const navPath = relativePathToRoot + '_navigation.html';

        fetch(navPath)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status} while fetching ${navPath}`);
                }
                return response.text();
            })
            .then(data => {
                navPlaceholder.innerHTML = data;
                initializeNavigation();
                // Now that nav is loaded, safe to run functions that depend on it.
                if (document.querySelectorAll('section').length > 0) {
                    setActiveNav(); // Initial call
                    window.addEventListener('scroll', setActiveNav);
                }
            });
    }

    // Theme toggle functionality
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    function setTheme(theme) {
        if (theme === 'light') {
            document.body.classList.add('light-mode');
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            document.body.classList.remove('light-mode');
            if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark');
        }
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('light-mode') ? 'light' : 'dark';
            setTheme(currentTheme === 'light' ? 'dark' : 'light');
        });
    }

    // Initialize theme on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Optional: set a default theme if none is saved
        setTheme('dark'); 
    }

    // Glossary modal
    const glossaryModal = document.getElementById('glossary-modal');
    const glossaryBackdrop = document.getElementById('glossary-modal-backdrop');
    document.body.addEventListener('click', function(event) {
        if (event.target.classList.contains('keyword-glossary')) {
            event.preventDefault();
            const term = event.target.dataset.term;
            const def = event.target.dataset.def;
            document.getElementById('glossary-term').textContent = term;
            document.getElementById('glossary-def').textContent = def;
            glossaryModal.style.display = 'block';
            glossaryBackdrop.style.display = 'block';
        }
    });

    function initializeNavigation() {
        const toggles = document.querySelectorAll('.nav-part-toggle');
        const links = document.querySelectorAll('#main-nav .nav-link');
        const currentPath = window.location.pathname;

        toggles.forEach(toggle => {
            const chapterList = toggle.nextElementSibling;
            const icon = toggle.querySelector('i.nav-part-chevron');

            if (chapterList && icon) {
                toggle.addEventListener('click', () => {
                    const isOpen = chapterList.classList.toggle('open');
                    icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
                });

                if (!chapterList.classList.contains('open')) {
                    icon.style.transform = 'rotate(0deg)';
                } else {
                    icon.style.transform = 'rotate(180deg)';
                }
            }
        });

        links.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (!linkHref) return;

            const absoluteLinkPath = new URL(linkHref, window.location.href).pathname;
            const normalize = (path) => {
                let p = path;
                if (p !== '/' && p.endsWith('/')) {
                    p = p.slice(0, -1);
                }
                if (p.endsWith('index.html')) {
                    p = p.substring(0, p.lastIndexOf('/'));
                    if(p === '') p = '/';
                }
                return p;
            };
            
            const normalizedCurrentPath = normalize(currentPath);
            const normalizedLinkPath = normalize(absoluteLinkPath);

            if (normalizedLinkPath === normalizedCurrentPath) {
                link.classList.add('active');
                let parentList = link.closest('.nav-chapters-list');
                while (parentList) {
                    parentList.classList.add('open');
                    const parentToggle = parentList.previousElementSibling;
                    if (parentToggle && parentToggle.classList.contains('nav-part-toggle')) {
                        const parentIcon = parentToggle.querySelector('i.nav-part-chevron');
                        if (parentIcon) {
                           parentIcon.style.transform = 'rotate(180deg)';
                        }
                    }
                    parentList = parentList.parentElement.closest('.nav-chapters-list');
                }
            }
        });
    }
    
    function closeModal() {
        if(glossaryModal) glossaryModal.style.display = 'none';
        if(glossaryBackdrop) glossaryBackdrop.style.display = 'none';
    }
    
    const glossaryCloseBtn = document.getElementById('glossary-close-btn');
    if (glossaryCloseBtn) {
        glossaryCloseBtn.addEventListener('click', closeModal);
    }
    if (glossaryBackdrop) {
        glossaryBackdrop.addEventListener('click', closeModal);
    }

    function setActiveNav() {
        let current = '';
        const currentSections = document.querySelectorAll('section');
        const currentNavLinks = document.querySelectorAll('#main-nav .nav-link');

        if (currentSections.length === 0 || currentNavLinks.length === 0) return;
        
        currentSections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });
        
        currentNavLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href) {
                const hashIndex = href.lastIndexOf('#');
                if (hashIndex !== -1) {
                    const idPart = href.substring(hashIndex + 1);
                    if (idPart === current) {
                        link.classList.add('active');
                    }
                }
            }
        });
    }
    
    const scrollToTopBtn = document.querySelector('.floating-btn:nth-child(1)');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Auto-run demos on page load
    if (document.getElementById('run-greeting-btn')) setTimeout(runInteractiveDemo, 500);
    if (document.getElementById('run-calculator-btn')) runCalculatorDemo();
    if (document.getElementById('run-cast-btn')) runCastDemo();
    if (document.getElementById('check-ticket-btn')) runConditionalDemo();
    if (document.getElementById('bark-btn')) runLoopDemo();
});

function handleCopyCode(event) {
    let buttonElement = event.target;
    if (buttonElement.tagName === 'I') {
        buttonElement = buttonElement.parentElement;
    }

    const codeBlockContainer = buttonElement.closest('.relative');
    if (!codeBlockContainer) return;

    const codeElement = codeBlockContainer.querySelector('pre code');
    if (!codeElement) return;

    const text = codeElement.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        const originalIconHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-check text-green-400"></i>';
        buttonElement.disabled = true;
        
        setTimeout(() => {
            buttonElement.innerHTML = originalIconHTML;
            buttonElement.disabled = false;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        const originalIconHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-times text-red-400"></i>';
        
        setTimeout(() => {
            buttonElement.innerHTML = originalIconHTML;
        }, 2000);
    });
}

document.addEventListener('click', function(event) {
    const copyButton = event.target.closest('.copy-code-btn');
    if (copyButton) {
        handleCopyCode(event);
    }
});

function copyCode(elementId) {
    const codeElement = document.getElementById(elementId);
    if (!codeElement) {
        console.error(`Element with ID ${elementId} not found for copyCode.`);
        return;
    }
    const text = codeElement.innerText;
    
    let buttonElement = null;
    if (window.event && window.event.target) {
        buttonElement = window.event.target;
        if (buttonElement.tagName === 'I') {
            buttonElement = buttonElement.parentElement;
        }
    }

    navigator.clipboard.writeText(text).then(() => {
        if (buttonElement) {
            const originalIconHTML = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fas fa-check text-green-400"></i>';
            buttonElement.disabled = true;
            setTimeout(() => {
                buttonElement.innerHTML = originalIconHTML;
                buttonElement.disabled = false;
            }, 2000);
        } else {
            console.log("Code copied (no button animation).");
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
         if (buttonElement) {
            const originalIconHTML = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fas fa-times text-red-400"></i>';
            setTimeout(() => {
                buttonElement.innerHTML = originalIconHTML;
            }, 2000);
        }
    });
}

function runInteractiveDemo() {
    const userNameInput = document.getElementById('user-name');
    const nameError = document.getElementById('name-error');
    const greetingOutput = document.getElementById('greeting-output');
    
    if(!userNameInput) return;

    userNameInput.classList.remove('border-red-500');
    nameError.classList.add('hidden');
    
    const userName = userNameInput.value.trim();
    
    if (!userName) {
        showError(userNameInput, nameError, "กรุณาป้อนชื่อของคุณ");
        return;
    }
    
    if (userName.length < 2 || userName.length > 20) {
        showError(userNameInput, nameError, "ชื่อต้องมีความยาว 2-20 ตัวอักษร");
        return;
    }
    
    if (!/^[A-Za-zก-๙\s]+$/.test(userName)) {
        showError(userNameInput, nameError, "ชื่อสามารถใช้ได้เฉพาะตัวอักษรและช่องว่าง");
        return;
    }
    
    greetingOutput.innerHTML = '';
    const message = `What's your name? ${userName}\nhello, ${userName}\n`;
    let i = 0;
    
    const typingEffect = setInterval(() => {
        if (i < message.length) {
            greetingOutput.innerHTML += message.charAt(i);
            i++;
            greetingOutput.scrollTop = greetingOutput.scrollHeight;
        } else {
            clearInterval(typingEffect);
        }
    }, 30);
}

function showError(inputElement, errorElement, message) {
    inputElement.classList.add('border-red-500', 'animate-shake');
    errorElement.querySelector('span').textContent = message;
    errorElement.classList.remove('hidden');
    
    const greetingOutput = document.getElementById('greeting-output');
    if(greetingOutput) {
        greetingOutput.innerHTML = `<div class="text-red-400 text-center py-4"><i class="fas fa-exclamation-triangle mr-2"></i>${message}</div>`;
    }
    
    setTimeout(() => {
        inputElement.classList.remove('animate-shake');
    }, 500);
}

const runGreetingBtn = document.getElementById('run-greeting-btn');
if (runGreetingBtn) {
    runGreetingBtn.addEventListener('click', runInteractiveDemo);
}

function runCalculatorDemo() {
    const calcX = document.getElementById('calc-x');
    const calcY = document.getElementById('calc-y');
    const calculatorOutput = document.getElementById('calculator-output');
    const simX = document.getElementById('sim-x');
    const simY = document.getElementById('sim-y');
    const simOp = document.getElementById('sim-op');
    const simResult = document.getElementById('sim-result');

    if (!calcX) return;

    const x = parseFloat(calcX.value) || 0;
    const y = parseFloat(calcY.value) || 0;
    
    const activeOpBtn = document.querySelector('.calc-op-btn.active');
    const op = activeOpBtn ? activeOpBtn.dataset.op : '+';
    let symbol;
    
    let result;
    switch(op) {
        case '+': result = x + y; symbol = '+'; break;
        case '-': result = x - y; symbol = '-'; break;
        case '*': result = x * y; symbol = '×'; break;
        case '/': result = y !== 0 ? (x / y).toFixed(2) : 'Error'; symbol = '÷'; break;
        default: result = x + y; symbol = '+';
    }
    
    calculatorOutput.innerHTML = `<div class="text-center py-6"><div class="text-5xl font-bold text-primary-400 mb-2">${result}</div><div class="text-xl text-slate-300">${x} ${symbol} ${y} = ${result}</div></div>`;
    simX.textContent = x;
    simY.textContent = y;
    simOp.textContent = symbol;
    simResult.textContent = result;
}

const runCalculatorBtn = document.getElementById('run-calculator-btn');
if (runCalculatorBtn) {
    runCalculatorBtn.addEventListener('click', runCalculatorDemo);
}

const calcOpBtns = document.querySelectorAll('.calc-op-btn');
calcOpBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.calc-op-btn').forEach(b => b.classList.remove('bg-primary-500', 'text-white', 'active'));
        this.classList.add('bg-primary-500', 'text-white', 'active');
        runCalculatorDemo();
    });
});

function runCastDemo() {
    const castValueEl = document.getElementById('cast-value');
    const castTypeEl = document.getElementById('cast-type');
    const castResultEl = document.getElementById('cast-result');

    if (!castValueEl) return;

    const inputValue = castValueEl.value;
    const castType = castTypeEl.value;
    
    try {
        let result, explanation;
        switch(castType) {
            case 'int':
                result = parseInt(inputValue) || 0;
                explanation = `แปลงเป็น int จะตัดทศนิยมทิ้ง`;
                break;
            case 'float':
                result = parseFloat(inputValue) || 0.0;
                explanation = `แปลงเป็น float จะเก็บค่าทศนิยม`;
                break;
            case 'char':
                result = inputValue.charAt(0) || '';
                explanation = `แปลงเป็น char จะได้ตัวอักษรตัวแรก`;
                break;
            default: result = "ไม่รองรับ"; explanation = "";
        }
        castResultEl.innerHTML = `<div class="text-xl font-bold text-green-400 mb-2">${result}</div><div class="text-slate-300">${explanation}</div>`;
    } catch (error) {
        castResultEl.innerHTML = `<div class="text-red-400">Error: ${error.message}</div>`;
    }
}

const runCastBtn = document.getElementById('run-cast-btn');
if (runCastBtn) {
    runCastBtn.addEventListener('click', runCastDemo);
}

function runConditionalDemo() {
    const userAgeEl = document.getElementById('user-age');
    const decisionOutputEl = document.getElementById('decision-output');
    const codeSimulationEl = document.getElementById('code-simulation');

    if (!userAgeEl) return;

    const age = parseInt(userAgeEl.value) || 0;
    const movieRatingChecked = document.querySelector('input[name="movie"]:checked');
    const movieRating = movieRatingChecked ? movieRatingChecked.value : 'G';
        
    let resultText, resultClass, codeSimulation;
    
    if (movieRating === "G") {
        resultText = "✅ ซื้อตั๋วได้เลย!";
        resultClass = "text-green-400";
        codeSimulation = `printf("ดูได้ทุกวัย");`;
    } else if (movieRating === "PG-13") {
        if (age >= 13) {
            resultText = "✅ ซื้อตั๋วได้เลย!";
            resultClass = "text-green-400";
            codeSimulation = `if (age >= 13) { ... }`;
        } else {
            resultText = "❌ อายุไม่ถึง 13 ปี";
            resultClass = "text-red-400";
            codeSimulation = `if (age >= 13) { ... } else { ... }`;
        }
    } else if (movieRating === "R") {
        if (age >= 18) {
            resultText = "✅ ซื้อตั๋วได้เลย!";
            resultClass = "text-green-400";
            codeSimulation = `if (age >= 18) { ... }`;
        } else {
            resultText = "❌ อายุไม่ถึง 18 ปี";
            resultClass = "text-red-400";
            codeSimulation = `if (age >= 18) { ... } else { ... }`;
        }
    }
    
    decisionOutputEl.innerHTML = `<div class="text-center py-6"><div class="text-3xl font-bold ${resultClass} mb-2">${resultText}</div></div>`;
    codeSimulationEl.textContent = codeSimulation;
}

const checkTicketBtn = document.getElementById('check-ticket-btn');
if (checkTicketBtn) {
    checkTicketBtn.addEventListener('click', runConditionalDemo);
    document.querySelectorAll('input[name="movie"]').forEach(radio => {
        radio.addEventListener('change', runConditionalDemo);
    });
    document.getElementById('user-age').addEventListener('input', runConditionalDemo);
}
 
function runLoopDemo() {
    const barkCountEl = document.getElementById('bark-count');
    const loopConditionEl = document.getElementById('loop-condition');
    const barkResultEl = document.getElementById('bark-result');
    const loopCodeEl = document.getElementById('loop-code');
    const loopVisualizationEl = document.getElementById('loop-visualization');
    const breakBtnEl = document.getElementById('break-btn');
    const continueBtnEl = document.getElementById('continue-btn');
    const controlPointEl = document.getElementById('control-point');

    if (!barkCountEl) return;

    const barkCount = parseInt(barkCountEl.value);
    const activeLoopTypeBtn = document.querySelector('.loop-type-btn.active');
    const loopType = activeLoopTypeBtn ? activeLoopTypeBtn.dataset.loopType : 'for';
    const useBreak = breakBtnEl.classList.contains('active');
    const useContinue = continueBtnEl.classList.contains('active');
    const controlPoint = parseInt(controlPointEl.value) || 3;
    
    loopConditionEl.style.display = (useBreak || useContinue) ? 'block' : 'none';
    
    let result = '', code = '', visualizationHTML = '';
    
    if (loopType === 'for') {
        code = `for (int i = 0; i < ${barkCount}; i++) { ... }`;
        for (let i = 0; i < barkCount; i++) {
            if (useContinue && i === controlPoint - 1) {
                visualizationHTML += `<div class="bg-yellow-800 p-2 rounded">⏩</div>`;
                continue;
            }
            if (useBreak && i === controlPoint) {
                visualizationHTML += `<div class="bg-red-800 p-2 rounded">🛑</div>`;
                result += `🛑 หยุดที่รอบ ${i+1}\n`;
                break;
            }
            visualizationHTML += `<div class="bg-blue-800 p-2 rounded">🐶</div>`;
            result += `🐶 Woof!\n`;
        }
    } else { // while loop
        code = `while (i < ${barkCount}) { ... }`;
        let i = 0;
        while (i < barkCount) {
            i++;
            if (useContinue && i === controlPoint) {
                visualizationHTML += `<div class="bg-yellow-800 p-2 rounded">⏩</div>`;
                continue;
            }
            if (useBreak && i === controlPoint + 1) {
                visualizationHTML += `<div class="bg-red-800 p-2 rounded">🛑</div>`;
                result += `🛑 หยุดที่รอบ ${i}\n`;
                break;
            }
            visualizationHTML += `<div class="bg-green-800 p-2 rounded">🐶</div>`;
            result += `🐶 Woof!\n`;
        }
    }
    
    barkResultEl.textContent = result || "⚠️ เลือกจำนวนครั้ง > 0";
    loopCodeEl.textContent = code;
    loopVisualizationEl.innerHTML = visualizationHTML;
}

const breakBtn = document.getElementById('break-btn');
const continueBtn = document.getElementById('continue-btn');
if (breakBtn && continueBtn) {
    breakBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        continueBtn.classList.remove('active');
        runLoopDemo();
    });

    continueBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        breakBtn.classList.remove('active');
        runLoopDemo();
    });
}

const barkBtn = document.getElementById('bark-btn');
if (barkBtn) {
    barkBtn.addEventListener('click', runLoopDemo);
    document.getElementById('bark-count').addEventListener('input', runLoopDemo);
    document.querySelectorAll('.loop-type-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.loop-type-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            runLoopDemo();
        });
    });
}