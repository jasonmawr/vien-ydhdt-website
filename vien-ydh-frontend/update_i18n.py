import json

def update_json(filepath, lang):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Metadata
    if 'metadata' not in data:
        data['metadata'] = {}
    
    if lang == 'vi':
        data['metadata']['titleDefault'] = "Viện Y Dược Học Dân Tộc | Chăm Sóc Sức Khỏe Bằng Y Học Cổ Truyền"
        data['metadata']['titleTemplate'] = "%s | Viện Y Dược Học Dân Tộc"
        data['metadata']['description'] = "Viện Y Dược Học Dân Tộc — Đơn vị nghiên cứu và điều trị hàng đầu về Y học Cổ truyền Việt Nam. Đặt lịch, tra cứu dược liệu và tìm hiểu chuyên gia uy tín."
        data['metadata']['keywords'] = "Viện Y Dược Học Dân Tộc, y học cổ truyền, đặt lịch khám bệnh, dược liệu đông y, bác sĩ y học cổ truyền, khám bệnh online"
        data['metadata']['siteName'] = "Viện Y Dược Học Dân Tộc"
        data['metadata']['ogTitle'] = "Viện Y Dược Học Dân Tộc | Y Học Cổ Truyền Việt Nam"
        data['metadata']['ogDescription'] = "Khám phá dịch vụ chăm sóc sức khỏe bằng Y học Cổ truyền của Viện Y Dược Học Dân Tộc — Đặt lịch nhanh, Dược liệu chuẩn, Bác sĩ giỏi."
        
        data['chatWidget'] = {
            "welcome": "Xin chào! 👋 Tôi là **Y Dược AI** — trợ lý ảo của Viện Y Dược Học Dân Tộc TP.HCM.\n\nTôi có thể giúp bạn:\n- 📋 Thông tin dịch vụ & giá khám\n- 🕐 Giờ làm việc & địa chỉ\n- 📅 Hướng dẫn đặt lịch khám\n- 💊 Giới thiệu chuyên khoa\n\nBạn cần hỗ trợ gì ạ?",
            "error": "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại hoặc gọi **(028) 3844 2349** để được hỗ trợ.",
            "title": "Y Dược AI",
            "subtitle": "Trợ lý ảo Viện Y Dược Học Dân Tộc",
            "online": "Trực tuyến",
            "placeholder": "Nhập câu hỏi của bạn...",
            "disclaimer": "Y Dược AI — Trợ lý ảo, không thay thế bác sĩ",
            "ariaOpen": "Mở chatbot Y Dược AI",
            "ariaClose": "Đóng chatbot",
            "suggestions": {
                "hours": "Giờ làm việc của Viện?",
                "booking": "Cách đặt lịch khám online?",
                "insurance": "Viện có nhận BHYT không?"
            }
        }
    elif lang == 'en':
        data['metadata']['titleDefault'] = "Traditional Medicine Institute | Healthcare with Traditional Medicine"
        data['metadata']['titleTemplate'] = "%s | Traditional Medicine Institute"
        data['metadata']['description'] = "Traditional Medicine Institute — The leading unit for research and treatment in Vietnamese Traditional Medicine. Book appointments, search herbs, and find prestigious experts."
        data['metadata']['keywords'] = "Traditional Medicine Institute, traditional medicine, book appointment, oriental herbs, traditional medicine doctor, online booking"
        data['metadata']['siteName'] = "Traditional Medicine Institute"
        data['metadata']['ogTitle'] = "Traditional Medicine Institute | Vietnamese Traditional Medicine"
        data['metadata']['ogDescription'] = "Explore healthcare services using Traditional Medicine at the Traditional Medicine Institute — Fast booking, Standard herbs, Good doctors."
        
        data['chatWidget'] = {
            "welcome": "Hello! 👋 I am **Y Dược AI** — the virtual assistant of the Traditional Medicine Institute.\n\nI can help you with:\n- 📋 Service info & pricing\n- 🕐 Working hours & address\n- 📅 Booking instructions\n- 💊 Specialty introduction\n\nHow can I help you?",
            "error": "Sorry, I am experiencing an issue. Please try again or call **(028) 3844 2349** for support.",
            "title": "Y Dược AI",
            "subtitle": "Virtual Assistant of the Institute",
            "online": "Online",
            "placeholder": "Enter your question...",
            "disclaimer": "Y Dược AI — Virtual assistant, does not replace a doctor",
            "ariaOpen": "Open Y Dược AI chatbot",
            "ariaClose": "Close chatbot",
            "suggestions": {
                "hours": "Working hours?",
                "booking": "How to book online?",
                "insurance": "Do you accept health insurance?"
            }
        }
    elif lang == 'zh':
        data['metadata']['titleDefault'] = "民族医药学院 | 传统医学健康护理"
        data['metadata']['titleTemplate'] = "%s | 民族医药学院"
        data['metadata']['description'] = "民族医药学院 — 越南传统医学研究和治疗的领先单位。预约、搜索草药并寻找著名的专家。"
        data['metadata']['keywords'] = "民族医药学院, 传统医学, 预约, 东方草药, 传统医学医生, 在线预约"
        data['metadata']['siteName'] = "民族医药学院"
        data['metadata']['ogTitle'] = "民族医药学院 | 越南传统医学"
        data['metadata']['ogDescription'] = "探索民族医药学院的传统医学健康护理服务 — 快速预约，标准草药，名医。"

        data['chatWidget'] = {
            "welcome": "你好！👋 我是 **Y Dược AI** — 民族医药学院的虚拟助手。\n\n我可以帮助您了解：\n- 📋 服务信息和定价\n- 🕐 工作时间和地址\n- 📅 预约说明\n- 💊 专科介绍\n\n我能帮您什么？",
            "error": "抱歉，我遇到了一些问题。请重试或致电 **(028) 3844 2349** 获取支持。",
            "title": "Y Dược AI",
            "subtitle": "学院虚拟助手",
            "online": "在线",
            "placeholder": "输入您的问题...",
            "disclaimer": "Y Dược AI — 虚拟助手，不能替代医生",
            "ariaOpen": "打开 Y Dược AI 聊天机器人",
            "ariaClose": "关闭聊天机器人",
            "suggestions": {
                "hours": "工作时间？",
                "booking": "如何在线预约？",
                "insurance": "你们接受医疗保险吗？"
            }
        }
        
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

update_json(r'f:\HAILEO\My Project\vien-ydhdt-website\vien-ydh-frontend\messages\vi.json', 'vi')
update_json(r'f:\HAILEO\My Project\vien-ydhdt-website\vien-ydh-frontend\messages\en.json', 'en')
update_json(r'f:\HAILEO\My Project\vien-ydhdt-website\vien-ydh-frontend\messages\zh.json', 'zh')
