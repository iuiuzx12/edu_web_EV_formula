document.addEventListener('DOMContentLoaded', function () {
    const navPlaceholder = document.getElementById('nav-placeholder');
    if (navPlaceholder) {
        // ตรวจสอบว่าเราอยู่ในหน้า lessons หรือไม่เพื่อกำหนด path ให้ถูกต้อง
        const navPath = window.location.pathname.includes('/lessons/') ? '../_navigation.html' : '_navigation.html';

        fetch(navPath)
            .then(response => response.text())
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
            toggle.addEventListener('click', () => {
                const chapterList = toggle.nextElementSibling;
                const icon = toggle.querySelector('i');

                chapterList.classList.toggle('hidden');
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            });
        });

        links.forEach(link => {
            // ทำให้ link ของหน้าที่เราอยู่ active
            if (link.getAttribute('href') === currentPath || link.getAttribute('href') === '..' + currentPath) {
                link.classList.add('active');
                
                // เปิด section ของหน้าที่ active อยู่
                const parentList = link.closest('.nav-chapters-list');
                if (parentList) {
                    parentList.classList.remove('hidden');
                    const parentToggle = parentList.previousElementSibling;
                    const parentIcon = parentToggle.querySelector('i');
                    parentIcon.classList.replace('fa-chevron-down', 'fa-chevron-up');
                }
            }
        });
    }
    
    function closeModal() {
        glossaryModal.style.display = 'none';
        glossaryBackdrop.style.display = 'none';
    }
    
    document.getElementById('glossary-close-btn').addEventListener('click', closeModal);
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

    // รันอัตโนมัติเมื่อหน้าโหลดเสร็จ (optional), เฉพาะเมื่อมีปุ่มนี้เท่านั้น
    document.addEventListener('DOMContentLoaded', function() {
        // ตรวจสอบอีกครั้งภายใน DOMContentLoaded เผื่อกรณี script โหลดแบบ async/defer
        if (document.getElementById('user-name') && document.getElementById('greeting-output')) {
            setTimeout(runInteractiveDemo, 1000);
        }
    });
}

// ===== ฟังก์ชันสำหรับบทที่ 4 =====
function runCalculatorDemo() {
    const x = parseFloat(document.getElementById('calc-x').value) || 0;
    const y = parseFloat(document.getElementById('calc-y').value) || 0;
    
    // ดึงตัวดำเนินการที่ผู้ใช้เลือกจริงๆ
    const activeOpBtn = document.querySelector('.calc-op-btn.active');
    const op = activeOpBtn ? activeOpBtn.dataset.op : '+';
    let symbol;
    
    // คำนวณผลลัพธ์ตามตัวดำเนินการที่เลือก
    let result;
    switch(op) {
        case '+':
            result = x + y;
            symbol = '+';
            break;
        case '-':
            result = x - y;
            symbol = '-';
            break;
        case '*':
            result = x * y;
            symbol = '×';
            break;
        case '/':
            result = y !== 0 ? (x / y).toFixed(2) : 'Error: หารด้วยศูนย์';
            symbol = '÷';
            break;
        default:
            result = x + y;
            symbol = '+';
    }
    
    // แสดงผลลัพธ์
    const outputDiv = document.getElementById('calculator-output');
    outputDiv.innerHTML = `
        <div class="text-center py-6">
            <div class="text-5xl font-bold text-primary-400 mb-2">${result}</div>
            <div class="text-xl text-slate-300">${x} ${symbol} ${y} = ${result}</div>
        </div>
    `;
    
    // อัปเดตข้อมูลจำลอง
    document.getElementById('sim-x').textContent = x;
    document.getElementById('sim-y').textContent = y;
    document.getElementById('sim-op').textContent = symbol;
    document.getElementById('sim-result').textContent = result;
}

// เพิ่ม event listeners สำหรับเครื่องคิดเลข
// const runCalculatorBtn is already defined and checked before auto-run setup
if (runCalculatorBtn) { // This is the button with id 'run-calculator-btn'
    runCalculatorBtn.addEventListener('click', runCalculatorDemo);
}

// เลือกตัวดำเนินการ
const calcOpBtns = document.querySelectorAll('.calc-op-btn');
if (calcOpBtns.length > 0) {
    calcOpBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            // ลบสถานะ active จากปุ่มอื่นๆ
            document.querySelectorAll('.calc-op-btn').forEach(b => b.classList.remove('bg-primary-500', 'text-white', 'active'));
            
            // ตั้งค่าปุ่มปัจจุบันเป็น active
            this.classList.add('bg-primary-500', 'text-white', 'active');
            
            // รันการคำนวณใหม่
            if (typeof runCalculatorDemo === 'function' && document.getElementById('calc-x')) { // Check if demo is relevant
                runCalculatorDemo();
            }
        });
    });

    // ตั้งค่าตัวดำเนินการเริ่มต้น
    const defaultOpBtn = document.querySelector('.calc-op-btn[data-op="+"]');
    if (defaultOpBtn) {
        defaultOpBtn.classList.add('bg-primary-500', 'text-white', 'active');
    }
}

// เพิ่มในส่วน JavaScript ของบทที่ 4
// const runCastBtn is already defined and checked before auto-run setup
if (runCastBtn) { // This is the button with id 'run-cast-btn'
    runCastBtn.addEventListener('click', function() {
        // Ensure relevant elements exist before proceeding
        const castValueEl = document.getElementById('cast-value');
        const castTypeEl = document.getElementById('cast-type');
        const castResultEl = document.getElementById('cast-result');

        if (!castValueEl || !castTypeEl || !castResultEl) {
            console.warn("Type casting demo elements not found. Skipping cast operation.");
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
                // แก้ไขในส่วนของ case 'char'
                case 'char':
                    // แปลงค่าเป็นตัวเลขก่อน
                    const numValue = parseFloat(inputValue);
                    
                    if (isNaN(numValue)) {
                        result = "ไม่สามารถแปลงเป็นตัวเลขได้";
                        explanation = "กรุณาป้อนตัวเลขเพื่อแปลงเป็นตัวอักษร";
                    } else {
                        // ตรวจสอบว่าเป็นจำนวนเต็ม
                        if (Number.isInteger(numValue)) {
                            // ตรวจสอบขอบเขตค่า ASCII
                            if (numValue >= 0 && numValue <= 65535) {
                                result = `'${String.fromCharCode(numValue)}'`;
                                explanation = `แปลงจากค่า ASCII ${numValue} เป็นตัวอักษร`;
                            } else {
                                result = "เกินขอบเขต";
                                explanation = "ค่า ASCII ต้องอยู่ระหว่าง 0 ถึง 65535";
                            }
                        } else {
                            // ถ้าไม่ใช่จำนวนเต็ม ให้ใช้ตัวอักษรตัวแรก
                            result = `'${inputValue.charAt(0)}'`;
                            explanation = "ใช้ตัวอักษรตัวแรกของข้อความ (ไม่ใช่ค่า ASCII)";
                        }
                    }
                    break;
                default:
                    result = "ไม่รองรับชนิดนี้";
                    explanation = "";
            }
            
            // ในส่วนแสดงผลลัพธ์
            resultDiv.innerHTML = `
                <div class="text-xl font-bold text-green-400 mb-2">${result}</div>
                <div class="text-slate-300 mb-3">${explanation}</div>
                
                ${result === "ไม่สามารถแปลงเป็นตัวเลขได้" || result === "เกินขอบเขต" 
                    ? `<div class="bg-red-900 bg-opacity-30 p-2 rounded-lg text-red-200">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        ${explanation}
                    </div>`
                    : ''}
                
                <div class="mt-3 text-sm text-slate-500">
                    <i class="fas fa-info-circle mr-1"></i> 
                    ค่าเริ่มต้น: <code>${inputValue}</code> → ชนิด: ${castType}
                </div>
                
                <!-- เพิ่มตัวอย่างค่า ASCII -->
                <div class="mt-3 text-xs text-slate-600">
                    <p>ตัวอย่างค่า ASCII: 65='A', 66='B', 97='a', 98='b'</p>
                </div>
            `;
        } catch (error) {
            resultDiv.innerHTML = `
                <div class="text-red-400">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    เกิดข้อผิดพลาด: ${error.message}
                </div>
            `;
        }
    });
}


// ตัวอย่างการใช้งาน
// document.addEventListener('DOMContentLoaded', function() {
    // ตั้งค่าเริ่มต้น
    // document.getElementById('run-cast-btn').click(); // This is now handled by the auto-run logic for runCastBtn
// });

// รันตัวอย่างเมื่อหน้าโหลดเสร็จ
// document.addEventListener('DOMContentLoaded', function() {
    // setTimeout(runCalculatorDemo, 1500); // This is now handled by the auto-run logic for runCalculatorBtn
// });


// ===== ฟังก์ชันสำหรับบทที่ 5 =====
function runConditionalDemo() {
    const age = parseInt(document.getElementById('user-age').value) || 0;
    const movieRating = document.querySelector('input[name="movie"]:checked').value;
    const resultDiv = document.getElementById('cast-result');
    
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
            // แก้ไขในส่วนของ case 'char'
            case 'char':
                // แปลงค่าเป็นตัวเลขก่อน
                const numValue = parseFloat(inputValue);
                
                if (isNaN(numValue)) {
                    result = "ไม่สามารถแปลงเป็นตัวเลขได้";
                    explanation = "กรุณาป้อนตัวเลขเพื่อแปลงเป็นตัวอักษร";
                } else {
                    // ตรวจสอบว่าเป็นจำนวนเต็ม
                    if (Number.isInteger(numValue)) {
                        // ตรวจสอบขอบเขตค่า ASCII
                        if (numValue >= 0 && numValue <= 65535) {
                            result = `'${String.fromCharCode(numValue)}'`;
                            explanation = `แปลงจากค่า ASCII ${numValue} เป็นตัวอักษร`;
                        } else {
                            result = "เกินขอบเขต";
                            explanation = "ค่า ASCII ต้องอยู่ระหว่าง 0 ถึง 65535";
                        }
                    } else {
                        // ถ้าไม่ใช่จำนวนเต็ม ให้ใช้ตัวอักษรตัวแรก
                        result = `'${inputValue.charAt(0)}'`;
                        explanation = "ใช้ตัวอักษรตัวแรกของข้อความ (ไม่ใช่ค่า ASCII)";
                    }
                }
                break;
            default:
                result = "ไม่รองรับชนิดนี้";
                explanation = "";
        }
        
        // ในส่วนแสดงผลลัพธ์
        resultDiv.innerHTML = `
            <div class="text-xl font-bold text-green-400 mb-2">${result}</div>
            <div class="text-slate-300 mb-3">${explanation}</div>
            
            ${result === "ไม่สามารถแปลงเป็นตัวเลขได้" || result === "เกินขอบเขต" 
                ? `<div class="bg-red-900 bg-opacity-30 p-2 rounded-lg text-red-200">
                    <i class="fas fa-exclamation-triangle mr-2"></i>
                    ${explanation}
                </div>`
                : ''}
            
            <div class="mt-3 text-sm text-slate-500">
                <i class="fas fa-info-circle mr-1"></i> 
                ค่าเริ่มต้น: <code>${inputValue}</code> → ชนิด: ${castType}
            </div>
            
            <!-- เพิ่มตัวอย่างค่า ASCII -->
            <div class="mt-3 text-xs text-slate-600">
                <p>ตัวอย่างค่า ASCII: 65='A', 66='B', 97='a', 98='b'</p>
            </div>
        `;
    } catch (error) {
        resultDiv.innerHTML = `
            <div class="text-red-400">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                เกิดข้อผิดพลาด: ${error.message}
            </div>
        `;
    }
});

// ตัวอย่างการใช้งาน
document.addEventListener('DOMContentLoaded', function() {
    // ตั้งค่าเริ่มต้น
    document.getElementById('run-cast-btn').click();
});

// รันตัวอย่างเมื่อหน้าโหลดเสร็จ, เฉพาะเมื่อมี element ที่เกี่ยวข้อง
const runCalculatorBtn = document.getElementById('run-calculator-btn');
if (runCalculatorBtn) {
    document.addEventListener('DOMContentLoaded', function() {
        // ตรวจสอบ elements ที่ runCalculatorDemo ใช้
        if (document.getElementById('calc-x') && 
            document.getElementById('calc-y') &&
            document.getElementById('calculator-output')) {
            setTimeout(runCalculatorDemo, 1500);
        }
    });
}

// เพิ่มการตรวจสอบสำหรับ run-cast-btn ก่อนเรียก click
const runCastBtn = document.getElementById('run-cast-btn');
if (runCastBtn) {
    // Event listener สำหรับปุ่ม run-cast-btn ควรอยู่นอก DOMContentLoaded ถ้าปุ่มถูกสร้างแบบ dynamic
    // แต่ในกรณีนี้ HTML มีปุ่มอยู่แล้ว การผูก event listener สามารถทำได้เลย
    // (โค้ดเดิมผูก event listener โดยตรง ไม่ได้อยู่ใน DOMContentLoaded สำหรับการผูก)

    document.addEventListener('DOMContentLoaded', function() {
        // ตรวจสอบ elements ที่ runCastDemo (listener ของ run-cast-btn) ใช้
        if (document.getElementById('cast-value') && 
            document.getElementById('cast-type') &&
            document.getElementById('cast-result')) {
            runCastBtn.click(); // เรียก click เพื่อแสดงผลเริ่มต้น
        }
    });
}


// ===== ฟังก์ชันสำหรับบทที่ 5 =====
function runConditionalDemo() {
    const age = parseInt(document.getElementById('user-age').value) || 0;
    const movieRating = document.querySelector('input[name="movie"]:checked').value;
    
    // ตรวจสอบเงื่อนไข
    let resultText = '';
    let resultClass = '';
    let codeSimulation = '';
    
    // สร้างโค้ดจำลอง
    codeSimulation = `int age = ${age};\nstring movie = "${movieRating}";\n\n`;
    
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
    
    // แสดงผลลัพธ์
    const outputDiv = document.getElementById('decision-output');
    outputDiv.innerHTML = `
        <div class="text-center py-6">
            <div class="text-3xl font-bold ${resultClass} mb-2">${resultText}</div>
            <div class="text-lg text-slate-300 mt-4">อายุ: ${age} ปี | ภาพยนตร์: ${movieRating}</div>
        </div>
    `;
    
    // แสดงโค้ดจำลอง
    document.getElementById('code-simulation').textContent = codeSimulation;
}

// เพิ่ม event listeners สำหรับบทที่ 5
// const checkTicketBtn is already defined and checked before auto-run setup
if (checkTicketBtn) { // This is the button with id 'check-ticket-btn'
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

    // Auto-run logic is already in place and guarded by 'if (checkTicketBtn)'
}
 
// ===== ฟังก์ชันสำหรับบทที่ 6 =====
// แก้ไขฟังก์ชัน runLoopDemo()
function runLoopDemo() {
    const barkCount = parseInt(document.getElementById('bark-count').value);
    const loopType = document.querySelector('.loop-type-btn.active').dataset.loopType;
    const useBreak = document.getElementById('break-btn').classList.contains('active');
    const useContinue = document.getElementById('continue-btn').classList.contains('active');
    const controlPoint = parseInt(document.getElementById('control-point').value) || 3;
    
    // แสดงส่วนเงื่อนไขถ้าเลือก break/continue
    document.getElementById('loop-condition').style.display = 
        (useBreak || useContinue) ? 'block' : 'none';
    
    // สร้างผลลัพธ์และโค้ด
    let result = '';
    let code = '';
    let visualizationHTML = '';
    
    if (loopType === 'for') {
        // for loop
        code = `for (int i = 0; i < ${barkCount}; i++) {\n`;
        
        if (useContinue) {
            code += `    if (i == ${controlPoint - 1}) continue; // ข้ามรอบนี้\n`;
        }
        if (useBreak) {
            code += `    if (i == ${controlPoint}) break; // ออกจากลูป\n`;
        }
        
        code += `    printf("🐶 Woof! (รอบที่ %d\\n", i+1);\n}`;
        
        for (let i = 0; i < barkCount; i++) {
            // เงื่อนไข continue
            if (useContinue && i === controlPoint - 1) {
                visualizationHTML += `
                    <div class="bg-yellow-800 bg-opacity-50 p-2 rounded">
                        <div class="text-xs text-yellow-300 mb-1">รอบที่ ${i+1} (continue)</div>
                        <div class="text-lg">⏩</div>
                    </div>
                `;
                continue;
            }
            
            // เงื่อนไข break
            if (useBreak && i === controlPoint) {
                visualizationHTML += `
                    <div class="bg-red-800 bg-opacity-50 p-2 rounded">
                        <div class="text-xs text-red-300 mb-1">รอบที่ ${i+1} (break)</div>
                        <div class="text-lg">🛑</div>
                    </div>
                `;
                result += `🛑 หยุดการทำงานที่รอบที่ ${i+1}\n`;
                break;
            }
            
            visualizationHTML += `
                <div class="bg-blue-800 bg-opacity-30 p-2 rounded">
                    <div class="text-xs text-loop-highlight mb-1">รอบที่ ${i+1}</div>
                    <div class="text-lg">🐶</div>
                </div>
            `;
            result += `🐶 Woof! (รอบที่ ${i+1})\n`;
        }
    } else {
        // while loop
        code = `int i = 0;\nwhile (i < ${barkCount}) {\n    i++;\n\n`;
        
        if (useContinue) {
            code += `    if (i == ${controlPoint}) continue; // ข้ามรอบนี้\n`;
        }
        if (useBreak) {
            code += `    if (i == ${controlPoint + 1}) break; // ออกจากลูป\n`;
        }
        
        code += `    printf("🐶 Woof! (รอบที่ %d\\n", i);\n}`;
        
        let i = 0;
        while (i < barkCount) {
            i++;
            
            // เงื่อนไข continue
            if (useContinue && i === controlPoint) {
                visualizationHTML += `
                    <div class="bg-yellow-800 bg-opacity-50 p-2 rounded">
                        <div class="text-xs text-yellow-300 mb-1">รอบที่ ${i} (continue)</div>
                        <div class="text-lg">⏩</div>
                    </div>
                `;
                continue;
            }
            
            // เงื่อนไข break
            if (useBreak && i === controlPoint + 1) {
                visualizationHTML += `
                    <div class="bg-red-800 bg-opacity-50 p-2 rounded">
                        <div class="text-xs text-red-300 mb-1">รอบที่ ${i} (break)</div>
                        <div class="text-lg">🛑</div>
                    </div>
                `;
                result += `🛑 หยุดการทำงานที่รอบที่ ${i}\n`;
                break;
            }
            
            visualizationHTML += `
            <div class="bg-green-800 bg-opacity-30 p-2 rounded">
                <div class="text-xs text-loop-highlight mb-1">รอบที่ ${i}</div>
                <div class="text-lg">🐶</div>
            </div>
        `;
            result += `🐶 Woof! (รอบที่ ${i})\n`;
        }
    }
    
    // แสดงผลลัพธ์
    document.getElementById('bark-result').textContent = result || "⚠️ กรุณาเลือกจำนวนครั้งมากกว่า 0";
    document.getElementById('loop-code').textContent = code;
    document.getElementById('loop-visualization').innerHTML = visualizationHTML;
}

// เพิ่ม event listeners สำหรับ break/continue
document.getElementById('break-btn').addEventListener('click', function() {
    this.classList.toggle('active');
    this.classList.toggle('bg-red-500', this.classList.contains('active'));
    document.getElementById('continue-btn').classList.remove('active', 'bg-blue-500');
    runLoopDemo();
});

document.getElementById('continue-btn').addEventListener('click', function() {
    this.classList.toggle('active');
    this.classList.toggle('bg-blue-500', this.classList.contains('active'));
    document.getElementById('break-btn').classList.remove('active', 'bg-red-500');
    runLoopDemo();
});

// เมื่อค่า control point เปลี่ยน
document.getElementById('control-point').addEventListener('input', runLoopDemo);

// เพิ่ม event listeners สำหรับบทที่ 6
// const barkBtn is already defined and checked before auto-run setup
if (barkBtn) { // This is the button with id 'bark-btn'
    barkBtn.addEventListener('click', runLoopDemo);

    const barkCountInput = document.getElementById('bark-count');
    if (barkCountInput) {
        barkCountInput.addEventListener('input', runLoopDemo);
        // The separate listener for barkCountValueDisplay is already correctly placed inside 'if (barkBtn)'
    }

    const loopTypeBtns = document.querySelectorAll('.loop-type-btn');
    if (loopTypeBtns.length > 0) {
        loopTypeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.loop-type-btn').forEach(b => b.classList.remove('active', 'bg-primary-500', 'text-white'));
                this.classList.add('active', 'bg-primary-500', 'text-white');
                if (typeof runLoopDemo === 'function' && document.getElementById('bark-result')) { // Check if demo is relevant
                    runLoopDemo();
                }
            });
        });
    }
    
    // Event listeners for break/continue and control-point are already inside runLoopDemo or associated functions,
    // and those functions are called from barkBtn click or other guarded listeners.
    // The specific listeners for break-btn, continue-btn, control-point are:
    const breakBtn = document.getElementById('break-btn');
    if (breakBtn) {
        breakBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            this.classList.toggle('bg-red-500', this.classList.contains('active'));
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) {
                continueBtn.classList.remove('active', 'bg-blue-500');
            }
            if (typeof runLoopDemo === 'function' && document.getElementById('bark-result')) runLoopDemo();
        });
    }

    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            this.classList.toggle('bg-blue-500', this.classList.contains('active'));
            const breakBtn = document.getElementById('break-btn');
            if (breakBtn) {
                breakBtn.classList.remove('active', 'bg-red-500');
            }
            if (typeof runLoopDemo === 'function' && document.getElementById('bark-result')) runLoopDemo();
        });
    }

    const controlPointInput = document.getElementById('control-point');
    if (controlPointInput) {
        controlPointInput.addEventListener('input', runLoopDemo);
    }
    
    // Auto-run logic is already in place and guarded by 'if (barkBtn)'
}

// เพิ่มฟังก์ชันสลับธีม
const themeToggleBtn = document.getElementById('theme-toggle');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', function() {
        const body = document.body;
        const themeIcon = document.getElementById('theme-icon');
        if (!themeIcon) return; // Guard against missing theme icon
    
    // สลับธีม
    body.classList.toggle('light-mode');
    
    // อัปเดตไอคอนและ localStorage
    if (body.classList.contains('light-mode')) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'light');
        
        // อัปเดตสีไอคอนในส่วนต่างๆ
        document.querySelectorAll('.nav-link i, .section-icon i').forEach(icon => {
            icon.style.color = 'white'; // ไอคอนใน sidebar ควรเป็นสีขาวเสมอ (เพราะพื้นหลังสี)
        });
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'dark');
        
        // คืนค่าสีไอคอน
        document.querySelectorAll('.nav-link i, .section-icon i').forEach(icon => {
            icon.style.color = '';
        });
    }
});

        // คืนค่าสีไอคอน
        document.querySelectorAll('.nav-link i, .section-icon i').forEach(icon => {
            icon.style.color = ''; // Reset to default CSS behavior
        });
    }
    updateIconColors(); // Call common icon update logic
});


// ตรวจสอบธีมที่บันทึกไว้ และเรียก updateIconColors
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('theme-icon'); // Already guarded by themeToggleBtn check for listener
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        if (themeIcon) {
            themeIcon.classList.replace('fa-moon', 'fa-sun');
        }
    }
    // Always call updateIconColors after potentially changing the theme based on localStorage
    // Ensure this runs after the body class might have been set.
    if (themeToggleBtn) { // Ensure theme functionality is present
      updateIconColors();
    }
});

// ฟังก์ชันสำหรับเปลี่ยนสีไอคอนใน section-icon
function updateIconColors() {
    // Ensure body exists, though it's highly unlikely it wouldn't at this point.
    if (!document.body) return; 
    
    const isLightMode = document.body.classList.contains('light-mode');
    const sectionIcons = document.querySelectorAll('.section-icon i');
    
    sectionIcons.forEach(icon => {
        if (isLightMode) {
            icon.style.color = 'white';
        } else {
            icon.style.color = ''; // Reset to default CSS behavior
        }
    });

    // For .nav-link i, they should always be white if the theme is light, due to dark sidebar background
    // This logic was in the theme toggle, let's consolidate or ensure it's correctly applied.
    // The current logic in theme toggle seems fine for .nav-link i.
}

// The direct call to updateIconColors() at the end of the file is now effectively handled
// by the DOMContentLoaded listener above, which calls it after setting the initial theme.
// The duplicate event listener for 'theme-toggle' calling updateIconColors was removed as
// updateIconColors is now called directly within the main theme toggle listener.