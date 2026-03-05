document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

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
            badge.style.display = 'none'; // バッジを消す
            if(chatOptions.children.length === 0) {
                showInitialOptions();
            }
        }
    };

    chatToggleBtn.addEventListener('click', toggleChat);
    closeChatBtn.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });

    // チャットの選択肢と返答ロジック
    // 電話を減らしWeb予約に誘導するための「1次対応」の設計
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
        
        // 追加前にoptionsを消す（順番の管理として一番下にoptionsを置くため）
        chatBody.insertBefore(msgDiv, chatOptions);
        
        // 自動スクロール
        setTimeout(() => {
            chatBody.scrollTop = chatBody.scrollHeight;
        }, 100);
    }

    function renderOptions(optionsArray) {
        chatOptions.innerHTML = ''; // クリア
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
        // ユーザーの選択をメッセージとして表示
        appendMessage(opt.text, true);
        chatOptions.innerHTML = ''; // 一旦選択肢を消す

        // 少し遅延させてボットの返答を演出
        setTimeout(() => {
            if (opt.action) {
                // アクションの実行（リンク遷移など）
                if (opt.action === 'reserve') {
                    appendMessage('ありがとうございます！別ウィンドウで予約画面を開きます。');
                    window.open(window.appConfig.reservationUrl, '_blank');
                    setTimeout(() => renderOptions([{text:"最初に戻る", next:"initial"}]), 1000);
                } else if (opt.action === 'link_bone') {
                    window.location.href = '/courses#course-bone';
                    chatbotWindow.classList.remove('active');
                } else if (opt.action === 'link_massage') {
                    window.location.href = '/courses#course-massage';
                    chatbotWindow.classList.remove('active');
                }
            } else if (opt.next) {
                // 次のフローに進む
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
    if (mapContainer && window.appConfig.address) {
        
        // フッターの住所も更新
        const footerAddress = document.getElementById('footer-address');
        if(footerAddress) footerAddress.innerHTML = `<i class="fa-solid fa-location-dot"></i> ${window.appConfig.address}`;

        const address = window.appConfig.address;
        
        // Nominatim API で座標を取得する (URLエンコード)
        const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

        fetch(geocodeUrl)
            .then(response => response.json())
            .then(data => {
                if(data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    
                    // コンテナをクリア
                    mapContainer.innerHTML = '';
                    
                    // Leaflet マップの初期化
                    const map = L.map('map').setView([lat, lon], 16);
                    
                    // OSMタイルレイヤーの追加
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    }).addTo(map);

                    // カスタムアイコン（オプションですがモダンに見せるために）
                    const customIcon = L.divIcon({
                        className: 'custom-pin',
                        html: '<i class="fa-solid fa-location-dot fa-2x" style="color:var(--secondary-color); text-shadow: 0 2px 4px rgba(0,0,0,0.3);"></i>',
                        iconSize: [30, 42],
                        iconAnchor: [15, 42]
                    });

                    // マーカーの追加
                    L.marker([lat, lon], {icon: customIcon}).addTo(map)
                        .bindPopup(`<b>◯◯接骨院</b><br>${address}`)
                        .openPopup();
                        
                } else {
                    mapContainer.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%;">マップ情報の取得に失敗しました。<br>正しい住所が設定されているかご確認ください。</div>';
                }
            })
            .catch(error => {
                console.error("Geocoding Error: ", error);
                mapContainer.innerHTML = '<div style="display:flex; justify-content:center; align-items:center; height:100%;">マップを読み込めませんでした。<br>インターネット接続をご確認ください。</div>';
            });
    }

});
