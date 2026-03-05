document.addEventListener('DOMContentLoaded', () => {
    
    // --- 0. 設定のハードコーディング (静的サイト用) ---
    // ここで直接予約URLと住所を管理します。変更する場合は以下の値を書き換えてください。
    const appConfig = {
        address: "東京都新宿区西新宿2-8-1",
        reservationUrl: "https://example.com/reserve" // ※ここに実際の予約アプリのURLを入れます
    };

    // すべての予約ボタンのリンク先を appConfig.reservationUrl に一括設定
    const reserveLinks = document.querySelectorAll('.js-reserve-link');
    reserveLinks.forEach(link => {
        link.href = appConfig.reservationUrl;
    });

    // --- 1. Navbar Scroll Effect & Mobile Menu ---
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.querySelector('.nav-links');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ハンバーガーメニューのトグル
    if(mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            if(navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-xmark');
            } else {
                icon.classList.remove('fa-xmark');
                icon.classList.add('fa-bars');
            }
        });
    }

    // スマホメニューでリンクをクリックしたらメニューを閉じる
    if(navLinks) {
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if(window.innerWidth <= 768) {
                    navLinks.classList.remove('active');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            });
        });
    }

    // --- 2. Chatbot Logic ---
    const chatToggleBtn = document.getElementById('chatToggleBtn');
    const chatbotWindow = document.getElementById('chatbotWindow');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatOptions = document.getElementById('chatOptions');
    const chatBody = document.getElementById('chatBody');
    const badge = document.querySelector('.chat-badge');

    // チャットの開閉
    const toggleChat = () => {
        chatbotWindow.classList.toggle('active');
        if (chatbotWindow.classList.contains('active')) {
            if(badge) badge.style.display = 'none'; // バッジを消す
            if(chatOptions.children.length === 0) {
                showInitialOptions();
            }
        }
    };

    if(chatToggleBtn) chatToggleBtn.addEventListener('click', toggleChat);
    if(closeChatBtn) closeChatBtn.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });

    const qaFlow = {
        initial: [
            { text: "ひどい肩こりや腰痛がある", next: "pain" },
            { text: "疲れやだるさが取れない", next: "tired" },
            { text: "どのコースが良いか分からない", next: "unknown" },
            { text: "料金や営業時間について", next: "info" }
        ],
        pain: {
            msg: "肩こりや腰痛でお悩みですね。当院の【全身骨格矯正コース】が一番おすすめです！根本から痛みにアプローチします。<br><br>すぐに予約して、プロにご相談しませんか？",
            options: [
                { text: "このままWeb予約する", action: "reserve" },
                { text: "コースの詳細を見る", action: "link_bone" },
                { text: "最初に戻る", next: "initial" }
            ]
        },
        tired: {
            msg: "慢性的なお疲れですね。それなら【深層マッサージ・筋膜リリースコース】がスッキリしておすすめです！<br><br>お好みの時間でご予約をお取りいただけます。",
            options: [
                { text: "このままWeb予約する", action: "reserve" },
                { text: "コースの詳細を見る", action: "link_massage" },
                { text: "最初に戻る", next: "initial" }
            ]
        },
        unknown: {
            msg: "ご来院時にカウンセリングを行い、あなたに最も合った施術をご提案いたします。<br>ご相談だけでも構いませんので、まずはご予約枠をお取りいただくことをおすすめします！",
            options: [
                { text: "まずはWeb予約する", action: "reserve" },
                { text: "最初に戻る", next: "initial" }
            ]
        },
        info: {
            msg: "当院の営業時間は 9:00〜20:00(水曜定休) です。<br>料金体系はコースにより 3,800円〜 となっております。詳細はコース一覧をご覧ください。<br>なお、スムーズなご案内のため、お電話より【Web予約】を推奨しております。",
            options: [
                { text: "Web予約する(推奨)", action: "reserve" },
                { text: "最初に戻る", next: "initial" }
            ]
        }
    };

    function appendMessage(text, isUser = false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-message ${isUser ? 'user-message' : 'bot-message'}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = isUser ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-leaf"></i>';
        
        const bubble = document.createElement('div');
        bubble.className = 'bubble';
        bubble.innerHTML = text;

        msgDiv.appendChild(avatar);
        msgDiv.appendChild(bubble);
        
        chatBody.insertBefore(msgDiv, chatOptions);
        
        setTimeout(() => {
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 100);
    }

    function renderOptions(optionsArray) {
        chatOptions.innerHTML = ''; 
        optionsArray.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'chat-option-btn';
            btn.innerHTML = opt.text;
            btn.onclick = () => handleOptionClick(opt);
            chatOptions.appendChild(btn);
        });
        setTimeout(() => {
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 100);
    }

    function showInitialOptions() {
        renderOptions(qaFlow.initial);
    }

    function handleOptionClick(opt) {
        appendMessage(opt.text, true);
        chatOptions.innerHTML = ''; 

        setTimeout(() => {
            if (opt.action) {
                if (opt.action === 'reserve') {
                    appendMessage('ありがとうございます！別ウィンドウで予約画面を開きます。');
                    window.open(appConfig.reservationUrl, '_blank');
                    setTimeout(() => renderOptions([{text:"最初に戻る", next:"initial"}]), 1000);
                } else if (opt.action === 'link_bone') {
                    window.location.href = 'courses.html#course-bone';
                    chatbotWindow.classList.remove('active');
                } else if (opt.action === 'link_massage') {
                    window.location.href = 'courses.html#course-massage';
                    chatbotWindow.classList.remove('active');
                }
            } else if (opt.next) {
                if (opt.next === 'initial') {
                    appendMessage('他に気になることはありますか？');
                    showInitialOptions();
                } else {
                    const nextStep = qaFlow[opt.next];
                    appendMessage(nextStep.msg);
                    renderOptions(nextStep.options);
                }
            }
        }, 600);
    }

    // --- 3. Dynamic Map Generation (Leaflet + Nominatim API) ---
    const mapContainer = document.getElementById('map');
    if (mapContainer && appConfig.address) {
        
        // 住所のテキスト表示を更新
        const displayAddressText = document.getElementById('display-address');
        if(displayAddressText) displayAddressText.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${appConfig.address}`;
        
        const footerAddress = document.getElementById('footer-address');
        if(footerAddress) footerAddress.innerHTML = `〒XXX-XXXX ${appConfig.address}`;

        const address = appConfig.address;
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                if(data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    
                    mapContainer.innerHTML = '';
                    
                    const map = L.map('map').setView([lat, lon], 16);
                    
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(map);

                    const customIcon = L.divIcon({
                        className: 'custom-pin',
                        html: '<i class="fa-solid fa-location-dot fa-2x" style="color:var(--secondary-color); text-shadow: 0 2px 4px rgba(0,0,0,0.3);"></i>',
                        iconSize: [30, 42],
                        iconAnchor: [15, 42]
                    });

                    L.marker([lat, lon], {icon: customIcon}).addTo(map)
                        .bindPopup(`<b>◯◯接骨院</b><br>${address}`)
                        .openPopup();
                        
                } else {
                    mapContainer.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%; padding:20px; text-align:center;">マップ情報の取得に失敗しました。<br>正しい住所が設定されているかご確認ください。</div>';
                }
            })
            .catch(error => {
                console.error("Geocoding Error: ", error);
                mapContainer.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%; padding:20px; text-align:center;">マップを読み込めませんでした。<br>インターネット接続をご確認ください。</div>';
            });
    }

});
