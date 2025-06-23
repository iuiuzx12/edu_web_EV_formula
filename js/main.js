document.addEventListener('DOMContentLoaded', function () {
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        // ตรวจสอบว่าเราอยู่ในหน้า lessons หรือไม่เพื่อกำหนด path ให้ถูกต้อง
        // const navPath = window.location.pathname.includes('/lessons/') ? '../_navigation.html' : '_navigation.html';
        const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '' && segment !== 'index.html');
        let relativePathToRoot = '';
        // นับจำนวน segments ที่ไม่ใช่ไฟล์ (ลงท้ายด้วย .html) เพื่อกำหนดความลึก
        // หากอยู่ใน root (เช่น /index.html หรือ /) pathSegments จะว่างเปล่า หรือมีแค่ชื่อไฟล์
        // หากอยู่ใน /lessons/foo.html, pathSegments จะเป็น ['lessons'] (หลัง filter ชื่อไฟล์)
        // หากอยู่ใน /lessons/bar/baz.html, pathSegments จะเป็น ['lessons', 'bar']

        // ปรับปรุง: พิจารณา path จาก root ของ site แทนที่จะเป็น root ของ repo
        // หาก window.location.pathname เป็น "/" หรือ "/index.html", pathSegments จะว่าง
        // หากเป็น "/lessons/foo.html", pathSegments จะเป็น ["lessons"]
        // หากเป็น "/lessons/sub/foo.html", pathSegments จะเป็น ["lessons", "sub"]
        // เราต้องการ '../' สำหรับแต่ละ segment ที่เป็น directory

        // เริ่มต้นด้วยการนับจำนวน directory levels จาก root
        // pathname เช่น "/lessons/lesson1/part1.html"
        // split('/') -> ["", "lessons", "lesson1", "part1.html"]
        // filter(Boolean) -> ["lessons", "lesson1", "part1.html"]
        const currentPathParts = window.location.pathname.split('/').filter(Boolean);
        
        // หากส่วนสุดท้ายเป็นชื่อไฟล์ (มี '.'), ให้เอามันออกเพื่อที่เราจะนับเฉพาะ directories
        if (currentPathParts.length > 0 && currentPathParts[currentPathParts.length - 1].includes('.')) {
            currentPathParts.pop();
        }
        
        // จำนวน '../' คือจำนวน directory levels ที่เราอยู่ลึกลงไป
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
            });
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
            // Ensure the elements exist before adding event listeners
            const chapterList = toggle.nextElementSibling;
            const icon = toggle.querySelector('i');

            if (chapterList && icon) {
                toggle.addEventListener('click', () => {
                    chapterList.classList.toggle('hidden');
                    icon.classList.toggle('fa-chevron-down');
                    icon.classList.toggle('fa-chevron-up');
                });

                // Set initial state based on whether the list is hidden or not
                // This is important if some submenus are meant to be open by default
                // or if state is restored (e.g. active link opens its parents)
                if (chapterList.classList.contains('hidden')) {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                } else {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                }
            }
        });

        links.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (!linkHref) return;

            // Resolve the link's href to an absolute path from the site root
            // This handles cases like href="page.html", href="./page.html", href="../page.html"
            const absoluteLinkPath = new URL(linkHref, window.location.origin + (linkHref.startsWith('/') ? '' : window.location.pathname)).pathname;

            // Normalize both currentPath and absoluteLinkPath for comparison
            // 1. Remove trailing slash (if not root "/")
            // 2. Ensure leading slash
            const normalize = (path) => {
                let p = path;
                if (p !== '/' && p.endsWith('/')) {
                    p = p.slice(0, -1);
                }
                if (!p.startsWith('/')) {
                    p = '/' + p;
                }
                return p;
            };
            
            const normalizedCurrentPath = normalize(currentPath);
            const normalizedLinkPath = normalize(absoluteLinkPath);

            if (normalizedLinkPath === normalizedCurrentPath) {
                link.classList.add('active');
                
                // Open all parent sections of the active link
                let parentList = link.closest('.nav-chapters-list');
                while (parentList) {
                    parentList.classList.remove('hidden');
                    const parentToggle = parentList.previousElementSibling;
                    if (parentToggle && parentToggle.classList.contains('nav-part-toggle')) {
                        const parentIcon = parentToggle.querySelector('i');
                        if (parentIcon) {
                            parentIcon.classList.remove('fa-chevron-down');
                            parentIcon.classList.add('fa-chevron-up');
                        }
                    }
                    // Move to the next parent list if this one is nested
                    const grandparent = parentList.parentElement.closest('.nav-chapters-list');
                    if (grandparent === parentList) { // Should not happen with correct HTML
                        break; 
                    }
                    parentList = grandparent;
                }
            }
        });
    }
    
    function closeModal() {
        glossaryModal.style.display = 'none';
        glossaryBackdrop.style.display = 'none';
    }
    
    const glossaryCloseBtn = document.getElementById('glossary-close-btn');
    if (glossaryCloseBtn) {
        glossaryCloseBtn.addEventListener('click', closeModal);
    }
    if (glossaryBackdrop) {
        glossaryBackdrop.addEventListener('click', closeModal);
    }

    // Navigation active state
    const navLinks = document.querySelectorAll('.nav-link'); // This might be empty if nav hasn't loaded yet
    const sections = document.querySelectorAll('section');
    
    // setActiveNav should ideally be called or its listeners attached AFTER nav is loaded.
    // However, its current placement within DOMContentLoaded but outside fetch's .then()
    // means navLinks might be empty.
    // For now, let's keep its original logic structure before the guard was added,
    // assuming initializeNavigation handles its own navLinks correctly.
    // The guard (if navLinks.length > 0) was problematic.
    
    function setActiveNav() {
        let current = '';
        const currentSections = document.querySelectorAll('section'); // Re-query in case of dynamic content
        const currentNavLinks = document.querySelectorAll('#main-nav .nav-link'); // Ensure we get links from loaded nav

        if (currentSections.length === 0 || currentNavLinks.length === 0) return; // Guard if no sections or nav links
        
        currentSections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 150) { // Check visibility
                current = section.getAttribute('id');
            }
        });
        
        currentNavLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            // Check if the link's href, after removing '../' or './' and then '#', matches the current section id
            // This logic is for same-page navigation links like '#sectionId'
            if (href) {
                const hashIndex = href.lastIndexOf('#');
                if (hashIndex !== -1) {
                    const idPart = href.substring(hashIndex + 1);
                    if (idPart === current) {
                        link.classList.add('active');
                    }
                }
                // For links that point to chapterX.html, initializeNavigation handles the active state based on path.
                // setActiveNav is primarily for in-page section highlighting.
            }
        });
    }
    
    // Attach scroll listener if there are sections to track
    if (sections.length > 0) {
        window.addEventListener('scroll', setActiveNav);
        // Initial call to set active nav based on current scroll position or hash
        // This should ideally run after nav is fully loaded and initialized.
        // Consider moving this call into the fetch().then() after initializeNavigation() if issues persist.
        // For now, let's assume initializeNavigation makes links available for setActiveNav to work.
        if (document.readyState === 'complete') {
            setActiveNav();
        } else {
            window.addEventListener('load', setActiveNav); // Fallback to window.load
        }
    }
    
    // Floating button - scroll to top
    const scrollToTopBtn = document.querySelector('.floating-btn:nth-child(1)');
    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // Card hover effect
    const cards = document.querySelectorAll('.content-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
});

// ===== ฟังก์ชันสำหรับบทที่ 3 (และปุ่ม copy ทั่วไป) =====
// ปรับปรุงฟังก์ชัน copyCode ให้รับ event และทำงานกับโครงสร้าง HTML โดยตรง
function handleCopyCode(event) {
    let buttonElement = event.target;
    // ถ้าคลิกที่ icon ภายใน button ให้ใช้ parentElement
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
        buttonElement.innerHTML = '<i class="fas fa-check text-green-400"></i>'; // ใช้ icon check สีเขียว
        buttonElement.disabled = true;
        
        setTimeout(() => {
            buttonElement.innerHTML = originalIconHTML;
            buttonElement.disabled = false;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        // อาจจะแสดงข้อความผิดพลาดให้ผู้ใช้เห็น
        const originalIconHTML = buttonElement.innerHTML;
        buttonElement.innerHTML = '<i class="fas fa-times text-red-400"></i>'; // Icon แสดงข้อผิดพลาด
        
        setTimeout(() => {
            buttonElement.innerHTML = originalIconHTML;
        }, 2000);
    });
}

// ผูก event listener กับปุ่ม copy code ทั้งหมดที่มีโครงสร้างตามที่คาดไว้
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.code-block').forEach(block => {
        // ค้นหาปุ่ม copy ที่อยู่ใน div.absolute ซึ่งเป็น sibling ของ pre.code-block หรือ parent ของมัน
        // โครงสร้างใน chapter1, 2: div.relative > div.absolute > button
        // โครงสร้างใน chapter3: มี id และ onclick โดยตรง (จะยังทำงานได้)
        const container = block.closest('.relative');
        if (container) {
            const copyButton = container.querySelector('.absolute button .fa-copy');
            if (copyButton && copyButton.parentElement) {
                 // ตรวจสอบว่ายังไม่ได้ผูก event listener อื่นที่เรียก copyCode แบบเก่า
                if (!copyButton.parentElement.hasAttribute('onclick')) {
                    copyButton.parentElement.addEventListener('click', handleCopyCode);
                }
            }
        }
    });
});


// ฟังก์ชัน copyCode เดิม (สำหรับ chapter 3 ที่ใช้ onclick)
function copyCode(elementId) {
    const codeElement = document.getElementById(elementId);
    if (!codeElement) {
        console.error(`Element with ID ${elementId} not found for copyCode.`);
        return;
    }
    const text = codeElement.innerText;
    
    // พยายามหา event.target ถ้า copyCode ถูกเรียกจาก onclick
    // นี่เป็นการคาดเดา อาจจะไม่แม่นยำเสมอไป
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
            // Fallback หรือ logging ถ้าไม่สามารถหา button element ได้
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


// แก้ไขฟังก์ชัน runInteractiveDemo()
function runInteractiveDemo() {
    const userNameInput = document.getElementById('user-name');
    const nameError = document.getElementById('name-error');
    const greetingOutput = document.getElementById('greeting-output');
    
    // Reset error state
    userNameInput.classList.remove('border-red-500');
    nameError.classList.add('hidden');
    
    // Validate input
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
    
    // สร้างเอฟเฟกต์การพิมพ์ทีละตัวอักษร
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

// เพิ่มฟังก์ชันแสดง error
function showError(inputElement, errorElement, message) {
    inputElement.classList.add('border-red-500');
    errorElement.querySelector('span').textContent = message;
    errorElement.classList.remove('hidden');
    
    const greetingOutput = document.getElementById('greeting-output');
    greetingOutput.innerHTML = `<div class="text-red-400 text-center py-4">
        <i class="fas fa-exclamation-triangle mr-2"></i>
        ${message}
    </div>`;
    
    // เพิ่มเอฟเฟกต์สั่น
    inputElement.classList.add('animate-shake');
    setTimeout(() => {
        inputElement.classList.remove('animate-shake');
    }, 500);
}

// เพิ่ม event listener สำหรับปุ่มรันโปรแกรม
const runGreetingBtn = document.getElementById('run-greeting-btn');
if (runGreetingBtn) {
    runGreetingBtn.addEventListener('click', runInteractiveDemo);
    // Auto-run logic will be handled by the main DOMContentLoaded listener
}

// ===== ฟังก์ชันสำหรับบทที่ 4 =====
function runCalculatorDemo() {
    const calcX = document.getElementById('calc-x');
    const calcY = document.getElementById('calc-y');
    const calculatorOutput = document.getElementById('calculator-output');
    const simX = document.getElementById('sim-x');
    const simY = document.getElementById('sim-y');
    const simOp = document.getElementById('sim-op');
    const simResult = document.getElementById('sim-result');

    if (!calcX || !calcY || !calculatorOutput || !simX || !simY || !simOp || !simResult) {
        // console.warn("Calculator demo elements not found. Skipping demo.");
        return;
    }

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
        case '/': result = y !== 0 ? (x / y).toFixed(2) : 'Error: หารด้วยศูนย์'; symbol = '÷'; break;
        default: result = x + y; symbol = '+';
    }
    
    calculatorOutput.innerHTML = `
        <div class="text-center py-6">
            <div class="text-5xl font-bold text-primary-400 mb-2">${result}</div>
            <div class="text-xl text-slate-300">${x} ${symbol} ${y} = ${result}</div>
        </div>
    `;
    
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
if (calcOpBtns.length > 0) {
    calcOpBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.calc-op-btn').forEach(b => b.classList.remove('bg-primary-500', 'text-white', 'active'));
            this.classList.add('bg-primary-500', 'text-white', 'active');
            if (typeof runCalculatorDemo === 'function' && document.getElementById('calc-x')) {
                runCalculatorDemo();
            }
        });
    });

    const defaultOpBtn = document.querySelector('.calc-op-btn[data-op="+"]');
    if (defaultOpBtn) {
        defaultOpBtn.classList.add('bg-primary-500', 'text-white', 'active');
    }
}

// ฟังก์ชันสำหรับ Type Casting Demo (บทที่ 4)
function runCastDemo() {
    const castValueEl = document.getElementById('cast-value');
    const castTypeEl = document.getElementById('cast-type');
    const castResultEl = document.getElementById('cast-result');

    if (!castValueEl || !castTypeEl || !castResultEl) {
        // console.warn("Type casting demo elements not found. Skipping cast operation.");
        return;
    }

    const inputValue = castValueEl.value;
    const castType = castTypeEl.value;
    const resultDiv = castResultEl;
    
    try {
        let result;
        let explanation;
        
        switch(castType) {
            case 'int':
                result = parseInt(inputValue);
                explanation = `การแปลงเป็น int จะตัดส่วนทศนิยมทิ้ง (ถ้ามี)`;
                break;
            case 'float':
                result = parseFloat(inputValue);
                explanation = `การแปลงเป็น float จะเก็บค่าทศนิยม`;
                break;
            case 'char':
                const numValue = parseFloat(inputValue);
                if (isNaN(numValue)) {
                    result = "ไม่สามารถแปลงเป็นตัวเลขได้";
                    explanation = "กรุณาป้อนตัวเลขเพื่อแปลงเป็นตัวอักษร";
                } else {
                    if (Number.isInteger(numValue)) {
                        if (numValue >= 0 && numValue <= 65535) {
                            result = `'${String.fromCharCode(numValue)}'`;
                            explanation = `แปลงจากค่า ASCII ${numValue} เป็นตัวอักษร`;
                        } else {
                            result = "เกินขอบเขต";
                            explanation = "ค่า ASCII ต้องอยู่ระหว่าง 0 ถึง 65535";
                        }
                    } else {
                        result = `'${inputValue.charAt(0)}'`;
                        explanation = "ใช้ตัวอักษรตัวแรกของข้อความ (ไม่ใช่ค่า ASCII)";
                    }
                }
                break;
            default:
                result = "ไม่รองรับชนิดนี้";
                explanation = "";
        }
        
        resultDiv.innerHTML = `
            <div class="text-xl font-bold text-green-400 mb-2">${result}</div>
            <div class="text-slate-300 mb-3">${explanation}</div>
            ${result === "ไม่สามารถแปลงเป็นตัวเลขได้" || result === "เกินขอบเขต" 
                ? `<div class="bg-red-900 bg-opacity-30 p-2 rounded-lg text-red-200"><i class="fas fa-exclamation-triangle mr-2"></i>${explanation}</div>`
                : ''}
            <div class="mt-3 text-sm text-slate-500"><i class="fas fa-info-circle mr-1"></i> ค่าเริ่มต้น: <code>${inputValue}</code> → ชนิด: ${castType}</div>
            <div class="mt-3 text-xs text-slate-600"><p>ตัวอย่างค่า ASCII: 65='A', 66='B', 97='a', 98='b'</p></div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `<div class="text-red-400"><i class="fas fa-exclamation-triangle mr-2"></i>เกิดข้อผิดพลาด: ${error.message}</div>`;
    }
}

const runCastBtn = document.getElementById('run-cast-btn');
if (runCastBtn) {
    runCastBtn.addEventListener('click', runCastDemo);
}


// ===== ฟังก์ชันสำหรับบทที่ 5 =====
function runConditionalDemo() {
    const userAgeEl = document.getElementById('user-age');
    const decisionOutputEl = document.getElementById('decision-output');
    const codeSimulationEl = document.getElementById('code-simulation');

    if (!userAgeEl || !decisionOutputEl || !codeSimulationEl) {
        // console.warn("Conditional demo elements not found. Skipping demo.");
        return;
    }
    const age = parseInt(userAgeEl.value) || 0;
    const movieRatingChecked = document.querySelector('input[name="movie"]:checked');
    if (!movieRatingChecked) {
        // console.warn("No movie rating selected. Skipping conditional demo.");
        return;
    }
    const movieRating = movieRatingChecked.value;
        
    let resultText = '';
    let resultClass = '';
    let codeSimulation = `int age = ${age};\nstring movie = "${movieRating}";\n\n`;
    
    if (movieRating === "G") {
        resultText = "✅ คุณสามารถซื้อตั๋วหนังระดับ G ได้ทันที!";
        resultClass = "text-green-400";
        codeSimulation += `if (movie == "G") {\n    printf("คุณสามารถซื้อตั๋วหนังระดับ G ได้ทันที!");\n}`;
    } 
    else if (movieRating === "PG-13") {
        if (age >= 13) {
            resultText = "✅ คุณสามารถซื้อตั๋วหนังระดับ PG-13 ได้!";
            resultClass = "text-green-400";
            codeSimulation += `if (age >= 13) {\n    printf("คุณสามารถซื้อตั๋วหนังระดับ PG-13 ได้!");\n}`;
        } else {
            resultText = "❌ ขออภัย! คุณอายุไม่ถึง 13 ปี ไม่สามารถดูหนังระดับ PG-13 ได้";
            resultClass = "text-red-400";
            codeSimulation += `if (age >= 13) {\n    // อนุญาต\n} else {\n    printf("ขออภัย! คุณอายุไม่ถึง 13 ปี");\n}`;
        }
    } 
    else if (movieRating === "R") {
        if (age >= 18) {
            resultText = "✅ คุณสามารถซื้อตั๋วหนังระดับ R ได้!";
            resultClass = "text-green-400";
            codeSimulation += `if (age >= 18) {\n    printf("คุณสามารถซื้อตั๋วหนังระดับ R ได้!");\n}`;
        } else {
            resultText = "❌ ขออภัย! คุณอายุไม่ถึง 18 ปี ไม่สามารถดูหนังระดับ R ได้";
            resultClass = "text-red-400";
            codeSimulation += `if (age >= 18) {\n    // อนุญาต\n} else {\n    printf("ขออภัย! คุณอายุไม่ถึง 18 ปี");\n}`;
        }
    }
    
    decisionOutputEl.innerHTML = `
        <div class="text-center py-6">
            <div class="text-3xl font-bold ${resultClass} mb-2">${resultText}</div>
            <div class="text-lg text-slate-300 mt-4">อายุ: ${age} ปี | ภาพยนตร์: ${movieRating}</div>
        </div>
    `;
    codeSimulationEl.textContent = codeSimulation;
}

const checkTicketBtn = document.getElementById('check-ticket-btn');
if (checkTicketBtn) {
    checkTicketBtn.addEventListener('click', runConditionalDemo);

    const movieRadioBtns = document.querySelectorAll('input[name="movie"]');
    if (movieRadioBtns.length > 0) {
        movieRadioBtns.forEach(radio => {
            radio.addEventListener('change', runConditionalDemo);
        });
    }

    const userAgeInputConditional = document.getElementById('user-age');
    if (userAgeInputConditional) {
        userAgeInputConditional.addEventListener('input', runConditionalDemo);
    }
}
 
// ===== ฟังก์ชันสำหรับบทที่ 6 =====
function runLoopDemo() {
    const barkCountEl = document.getElementById('bark-count');
    const loopConditionEl = document.getElementById('loop-condition');
    const barkResultEl = document.getElementById('bark-result');
    const loopCodeEl = document.getElementById('loop-code');
    const loopVisualizationEl = document.getElementById('loop-visualization');
    const breakBtnEl = document.getElementById('break-btn');
    const continueBtnEl = document.getElementById('continue-btn');
    const controlPointEl = document.getElementById('control-point');

    if (!barkCountEl || !loopConditionEl || !barkResultEl || !loopCodeEl || !loopVisualizationEl || !breakBtnEl || !continueBtnEl || !controlPointEl) {
        // console.warn("Loop demo elements not found. Skipping demo.");
        return;
    }

    const barkCount = parseInt(barkCountEl.value);
    const activeLoopTypeBtn = document.querySelector('.loop-type-btn.active');
    if (!activeLoopTypeBtn) {
        // console.warn("No loop type selected. Skipping loop demo.");
        return;
    }
    const loopType = activeLoopTypeBtn.dataset.loopType;
    const useBreak = breakBtnEl.classList.contains('active');
    const useContinue = continueBtnEl.classList.contains('active');
    const controlPoint = parseInt(controlPointEl.value) || 3;
    
    loopConditionEl.style.display = (useBreak || useContinue) ? 'block' : 'none';
    
    let result = '';
    let code = '';
    let visualizationHTML = '';
    
    if (loopType === 'for') {
        code = `for (int i = 0; i < ${barkCount}; i++) {\n`;
        if (useContinue) code += `    if (i == ${controlPoint - 1}) continue; // ข้ามรอบนี้\n`;
        if (useBreak) code += `    if (i == ${controlPoint}) break; // ออกจากลูป\n`;
        code += `    printf("🐶 Woof! (รอบที่ %d\\n", i+1);\n}`;
        
        for (let i = 0; i < barkCount; i++) {
            if (useContinue && i === controlPoint - 1) {
                visualizationHTML += `<div class="bg-yellow-800 bg-opacity-50 p-2 rounded"><div class="text-xs text-yellow-300 mb-1">รอบที่ ${i+1} (continue)</div><div class="text-lg">⏩</div></div>`;
                continue;
            }
            if (useBreak && i === controlPoint) {
                visualizationHTML += `<div class="bg-red-800 bg-opacity-50 p-2 rounded"><div class="text-xs text-red-300 mb-1">รอบที่ ${i+1} (break)</div><div class="text-lg">🛑</div></div>`;
                result += `🛑 หยุดการทำงานที่รอบที่ ${i+1}\n`;
                break;
            }
            visualizationHTML += `<div class="bg-blue-800 bg-opacity-30 p-2 rounded"><div class="text-xs text-loop-highlight mb-1">รอบที่ ${i+1}</div><div class="text-lg">🐶</div></div>`;
            result += `🐶 Woof! (รอบที่ ${i+1})\n`;
        }
    } else { // while loop
        code = `int i = 0;\nwhile (i < ${barkCount}) {\n    i++;\n\n`;
        if (useContinue) code += `    if (i == ${controlPoint}) continue; // ข้ามรอบนี้\n`;
        if (useBreak) code += `    if (i == ${controlPoint + 1}) break; // ออกจากลูป\n`;
        code += `    printf("🐶 Woof! (รอบที่ %d\\n", i);\n}`;
        
        let i = 0;
        while (i < barkCount) {
            i++;
            if (useContinue && i === controlPoint) {
                visualizationHTML += `<div class="bg-yellow-800 bg-opacity-50 p-2 rounded"><div class="text-xs text-yellow-300 mb-1">รอบที่ ${i} (continue)</div><div class="text-lg">⏩</div></div>`;
                continue;
            }
            if (useBreak && i === controlPoint + 1) {
                visualizationHTML += `<div class="bg-red-800 bg-opacity-50 p-2 rounded"><div class="text-xs text-red-300 mb-1">รอบที่ ${i} (break)</div><div class="text-lg">🛑</div></div>`;
                result += `🛑 หยุดการทำงานที่รอบที่ ${i}\n`;
                break;
            }
            visualizationHTML += `<div class="bg-green-800 bg-opacity-30 p-2 rounded"><div class="text-xs text-loop-highlight mb-1">รอบที่ ${i}</div><div class="text-lg">🐶</div></div>`;
            result += `🐶 Woof! (รอบที่ ${i})\n`;
        }
    }
    
    barkResultEl.textContent = result || "⚠️ กรุณาเลือกจำนวนครั้งมากกว่า 0";
    loopCodeEl.textContent = code;
    loopVisualizationEl.innerHTML = visualizationHTML;
}

const breakBtn = document.getElementById('break-btn');
const continueBtn = document.getElementById('continue-btn');
const controlPointInputLoop = document.getElementById('control-point');

if (breakBtn && continueBtn) {
    breakBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        this.classList.toggle('bg-red-500', this.classList.contains('active'));
        continueBtn.classList.remove('active', 'bg-blue-500');
        if (typeof runLoopDemo === 'function') runLoopDemo();
    });

    continueBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        this.classList.toggle('bg-blue-500', this.classList.contains('active'));
        breakBtn.classList.remove('active', 'bg-red-500');
        if (typeof runLoopDemo === 'function') runLoopDemo();
    });
}
if (controlPointInputLoop) {
    controlPointInputLoop.addEventListener('input', () => {
        if (typeof runLoopDemo === 'function') runLoopDemo();
    });
}


const barkBtn = document.getElementById('bark-btn');
if (barkBtn) {
    barkBtn.addEventListener('click', runLoopDemo);

    const barkCountInput = document.getElementById('bark-count');
    if (barkCountInput) {
        barkCountInput.addEventListener('input', runLoopDemo);
    }

    const loopTypeBtns = document.querySelectorAll('.loop-type-btn');
    if (loopTypeBtns.length > 0) {
        loopTypeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.loop-type-btn').forEach(b => b.classList.remove('active', 'bg-primary-500', 'text-white'));
                this.classList.add('active', 'bg-primary-500', 'text-white');
                if (typeof runLoopDemo === 'function' && document.getElementById('bark-result')) {
                    runLoopDemo();
                }
            });
        });
        // Set default active loop type if none is active
        if (!document.querySelector('.loop-type-btn.active') && loopTypeBtns.length > 0) {
            loopTypeBtns[0].classList.add('active', 'bg-primary-500', 'text-white');
        }
    }
}

// ฟังก์ชันสำหรับเปลี่ยนสีไอคอนใน section-icon และ nav-link
function updateIconColors() {
    if (!document.body) return;
    const isLightMode = document.body.classList.contains('light-mode');
    
    document.querySelectorAll('.section-icon i').forEach(icon => {
        icon.style.color = isLightMode ? 'white' : '';
    });
    // Nav link icons in sidebar should be white in light mode due to dark sidebar background
    document.querySelectorAll('#main-nav .nav-link i').forEach(icon => {
        icon.style.color = isLightMode ? 'white' : '';
    });
}

// เพิ่มฟังก์ชันสลับธีม
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
        const body = document.body;
        const themeIcon = document.getElementById('theme-icon');
        if (!themeIcon) return;
    
        body.classList.toggle('light-mode');
    
        if (body.classList.contains('light-mode')) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('theme', 'light');
        } else {
            themeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('theme', 'dark');
        }
        updateIconColors(); // Update icons after toggling theme
    });
}

// Main DOMContentLoaded listener for initial setup
document.addEventListener('DOMContentLoaded', function () {
    // Navigation placeholder moved to the top of the file

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('theme-icon');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
    }
    if (themeToggleBtn) { // Ensure theme functionality is present before updating colors
        updateIconColors(); // Initial icon color update
    }

    // Auto-run demos if their respective buttons and necessary elements exist
    if (runGreetingBtn && document.getElementById('user-name') && document.getElementById('greeting-output')) {
        setTimeout(runInteractiveDemo, 1000);
    }
    if (runCalculatorBtn && document.getElementById('calc-x') && document.getElementById('calc-y') && document.getElementById('calculator-output')) {
        // Set default operator for calculator if not already set by other logic
        const defaultCalcOpBtn = document.querySelector('.calc-op-btn[data-op="+"]');
        if (defaultCalcOpBtn && !document.querySelector('.calc-op-btn.active')) {
            defaultCalcOpBtn.click(); // Simulate click to set active and run demo
        } else {
            runCalculatorDemo(); // Run demo if an operator is already active
        }
    }
    if (runCastBtn && document.getElementById('cast-value') && document.getElementById('cast-type') && document.getElementById('cast-result')) {
        runCastDemo(); // Run cast demo on load
    }
    if (checkTicketBtn && document.getElementById('user-age') && document.querySelector('input[name="movie"]:checked') && document.getElementById('decision-output')) {
        runConditionalDemo(); // Run conditional demo on load
    }
    if (barkBtn && document.getElementById('bark-count') && document.querySelector('.loop-type-btn.active') && document.getElementById('bark-result')) {
        runLoopDemo(); // Run loop demo on load
    }
});