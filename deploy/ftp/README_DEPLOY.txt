
FoodAi FTP Deploy (simplified)
==============================

Çalıştırma:
1) Sunucuda bu klasöre girin:
   cd /path/to/deploy/ftp
2) .env.production dosyasını oluşturun (aşağıya bakınız)
3) npm install
4) npm start

Gerekli ENV (örnek):
NEXT_PUBLIC_SITE_URL=https://foodai.fi
NEXT_PUBLIC_SUPABASE_URL=https://wpkcawjvhnaykqjgcgye.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=***ANON***
SUPABASE_SERVICE_ROLE=***SERVICE_ROLE***   # sadece serverda kullanılır
DEEPSEEK_API_KEY=***DEEPSEEK***

Notlar:
- Supabase Auth redirect URL'lerini üretim domainine göre ayarlayın.
