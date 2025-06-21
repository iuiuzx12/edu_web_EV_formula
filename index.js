document.addEventListener('DOMContentLoaded', function () {
    // Progress bar
    const progressBar = document.getElementById('progress-bar');
    window.addEventListener('scroll', () => {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });

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
    
    function closeModal() {
        glossaryModal.style.display = 'none';
        glossaryBackdrop.style.display = 'none';
    }
    
    document.getElementById('glossary-close-btn').addEventListener('click', closeModal);
    glossaryBackdrop.addEventListener('click', closeModal);

    // Navigation active state
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    
    function setActiveNav() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (window.scrollY >= sectionTop - 150) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    }
    
    window.addEventListener('scroll', setActiveNav);
    setActiveNav();
    
    // Floating button - scroll to top
    document.querySelector('.floating-btn:nth-child(1)').addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
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

// ===== ฟังก์ชันสำหรับบทที่ 3 =====
function copyCode(elementId) {
    const codeElement = document.getElementById(elementId);
    const text = codeElement.innerText;
    
    navigator.clipboard.writeText(text).then(() => {
        // แสดงการแจ้งเตือนว่าคัดลอกสำเร็จ
        const originalIcon = event.target.innerHTML;
        event.target.innerHTML = '<i class="fas fa-check"></i>';
        
        setTimeout(() => {
            event.target.innerHTML = originalIcon;
        }, 2000);
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
document.getElementById('run-greeting-btn').addEventListener('click', runInteractiveDemo);

// รันอัตโนมัติเมื่อหน้าโหลดเสร็จ (optional)
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(runInteractiveDemo, 1000);
});

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
document.getElementById('run-calculator-btn').addEventListener('click', runCalculatorDemo);

// เลือกตัวดำเนินการ
document.querySelectorAll('.calc-op-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // ลบสถานะ active จากปุ่มอื่นๆ
        document.querySelectorAll('.calc-op-btn').forEach(b => b.classList.remove('bg-primary-500', 'text-white', 'active'));
        
        // ตั้งค่าปุ่มปัจจุบันเป็น active
        this.classList.add('bg-primary-500', 'text-white', 'active');
        
        // รันการคำนวณใหม่
        runCalculatorDemo();
    });
});

// ตั้งค่าตัวดำเนินการเริ่มต้น
const defaultOpBtn = document.querySelector('[data-op="+"]');
if (defaultOpBtn) {
    defaultOpBtn.classList.add('bg-primary-500', 'text-white', 'active');
}

// เพิ่มในส่วน JavaScript ของบทที่ 4
document.getElementById('run-cast-btn').addEventListener('click', function() {
    const inputValue = document.getElementById('cast-value').value;
    const castType = document.getElementById('cast-type').value;
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

// รันตัวอย่างเมื่อหน้าโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(runCalculatorDemo, 1500);
});

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
document.getElementById('check-ticket-btn').addEventListener('click', runConditionalDemo);
document.querySelectorAll('input[name="movie"]').forEach(radio => {
    radio.addEventListener('change', runConditionalDemo);
});
document.getElementById('user-age').addEventListener('input', runConditionalDemo);

// รันตัวอย่างเมื่อหน้าโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(runConditionalDemo, 1000);
});
 
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
document.getElementById('bark-btn').addEventListener('click', runLoopDemo);
document.getElementById('bark-count').addEventListener('input', runLoopDemo);

// เลือกประเภทลูป
document.querySelectorAll('.loop-type-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.loop-type-btn').forEach(b => b.classList.remove('active', 'bg-primary-500', 'text-white'));
        this.classList.add('active', 'bg-primary-500', 'text-white');
        runLoopDemo();
    });
});

// รันตัวอย่างเมื่อหน้าโหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(runLoopDemo, 1000);
});

// เพิ่มฟังก์ชันสลับธีม
// แก้ไขฟังก์ชันสลับธีมให้รองรับไอคอนเพิ่มเติม
// แก้ไขฟังก์ชันสลับธีม
document.getElementById('theme-toggle').addEventListener('click', function() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');
    
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

// ตรวจสอบธีมที่บันทึกไว้
document.addEventListener('DOMContentLoaded', function() {
    const savedTheme = localStorage.getItem('theme');
    const themeIcon = document.getElementById('theme-icon');
    
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        
        // อัปเดตสีไอคอนในส่วนต่างๆ สำหรับ light mode
        document.querySelectorAll('.nav-link i, .section-icon i').forEach(icon => {
            icon.style.color = 'white';
        });
    }
});

// ฟังก์ชันสำหรับเปลี่ยนสีไอคอนใน section-icon
function updateIconColors() {
    const isLightMode = document.body.classList.contains('light-mode');
    const icons = document.querySelectorAll('.section-icon i');
    
    icons.forEach(icon => {
        if (isLightMode) {
            icon.style.color = 'white';
        } else {
            icon.style.color = '';
        }
    });
}

// เรียกเมื่อโหลดหน้าและเมื่อเปลี่ยนธีม
updateIconColors();
document.getElementById('theme-toggle').addEventListener('click', updateIconColors);