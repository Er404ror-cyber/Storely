// Separamos os dados para não disparar re-renders desnecessários no HMR
export const translations = {
  en: {
    // Navigation & UI
    nav_home: "Home",
    nav_blog: "Blog",
    nav_support: "Support",
    nav_privacy: "Privacy",
    btn_dashboard: "GET STARTED",
    btn_close: "Close Menu",
    theme_light: "Light",
    theme_dark: "Dark",
    theme_auto: "Auto",
    theme_desc_night: "Active: Night (6pm-6am)",
    theme_desc_day: "Active: Day (6am-6pm)",
    menu_nav: "Navigation",
    language: "language",
    footer_rights: "All Rights Reserved",
    theme_desc_auto_base: "Changes automatically based on time.",
    theme_desc_manual: "This mode will stay active until you switch to Auto.",
    theme_click_toggle: "Click to toggle",

    // Hero Section
    hero_title_1: "Build",
    hero_title_2: "Your",
    hero_title_3: "Website",
    hero_title_4: "Here.",
    hero_desc: "The ultimate platform for those seeking extreme performance.",
    hero_subtitle: "No code. No limits.",
    btn_gallery: "VIEW GALLERY",

    // Features
    feat_tag: "Features",
    feat_title: "Everything in one place.",
    feat_1_title: "Drag & Drop Editor",
    feat_1_desc: "Build visually without touching a line of code. Simple, intuitive, and powerful.",
    feat_2_title: "Native SEO",
    feat_2_desc: "Your page is born optimized for search engines, ensuring better visibility.",
    feat_3_title: "Edge Hosting",
    feat_3_desc: "Sites loaded instantly anywhere in the world with our premium CDN.",

    // Showcase
    showcase_title_1: "Excellence in",
    showcase_title_2: "every pixel.",
    showcase_desc: "Explore high-performance websites created by our community of designers and entrepreneurs.",
    project_explore: "Explore Website",
    proj_1_tag: "E-commerce Engine",
    proj_1_desc: "An e-commerce infrastructure focused on loading speed and conversion optimized for modern retail.",
    proj_2_tag: "Design Systems",
    proj_2_desc: "Scalable interface architecture, demonstrating the versatility of our native components and visual fidelity.",

    // CTA
    cta_tag: "Instant Access",
    cta_title_1: "Ready to",
    cta_title_2: "master",
    cta_title_3: "the web?",
    cta_desc: "Join thousands of creators and get your project online in less than 10 minutes.",
    cta_subtitle: "No hidden costs.",
    btn_create_site: "CREATE MY SITE NOW",
    cta_members: "+12k members",

    // --- New Gallery Translations ---
    gallery_limit_error: "Limit Exceeded: Optimization Required",
    gallery_add: "Import Media",
    gallery_support: "Images & videos (JPG, PNG, MP4)\n1 MB photo · 10 MB video",
    gallery_file_error: "Individual size error detected",

    gallery_empty: "Start with an upload",
    gallery_empty_sub: "Initialize sequence via upload",
    gallery_compress: "Reduce",
    gallery_preview_mode: "Asset Preview Mode",
    gallery_scanning: "Scanning Asset...",
    gallery_weight: "Weight",
    gallery_limit_reached: "Full",
    gallery_slots: "Files",
    gallery_tutorial_title: "Combine your best captures in a high-performance professional layout.",
    gallery_limit_label: "Capacity",
    gallery_items: "Items",
    gallery_storage: "Storage",
  gallery_action_blocked: "Action Blocked",
  gallery_action_required: "Action Required",
  gallery_btn_blocked: "Blocked",
  gallery_btn_sync: "Sync Now",
  gallery_error_total_limit: "Remove files (Max 15MB)",
  gallery_error_individual: "Errors in specific files",
  gallery_pending_local: "Pending local files",
  gallery_msg_error: "Some files have errors. Remove or compress items marked in red.",
  gallery_msg_ready: "All set — sync to save. (Compression optional)",
  gallery_compress_images: "Compress images",
  gallery_compress_videos: "Compress videos",
  gallery_default_category: "Portfolio",
  gallery_default_title: "My Gallery",
  gallery_default_desc: "Click to edit your gallery description",
  gallery_tutorial_subtitle: "Empty Gallery",
  gallery_type_photos: "Photos",
  gallery_max_1mb: "Max 1MB",
  gallery_type_videos: "Video",
  gallery_max_10mb: "Max 10MB",

  gallery_new_badge: "New",




    // editor

    editor_modal_save_title: "Publish Site?",
    editor_modal_save_desc: "Do you want to make these changes public for all visitors?",
    editor_modal_discard_title: "Discard everything?",
    editor_modal_discard_desc: "Are you sure? You will lose all edits made in this session.",
    editor_modal_pending_media_title: "Pending Media!",
    editor_modal_pending_changes_title: "Pending Changes",
    editor_modal_nav_media_desc: "You have photos or videos that are still only on your computer. If you leave now, they will be deleted!",
    editor_modal_nav_changes_desc: "You have unsaved text or layout changes. What would you like to do?",
    editor_modal_sync_warning: "Sync media in the gallery before publishing",
    editor_modal_btn_locked: "Locked: Sync Media",
    editor_modal_btn_save: "Save and Publish",
    editor_modal_btn_discard: "Discard Changes",
    editor_modal_btn_discard_all: "Discard and Lose Media",
    editor_modal_btn_continue: "Continue Editing",


    limits: "Limit: {max} characters",
    uploading: "Uploading to cloud...",
    mediaSaved: "Media saved!",
    saveError: "Error saving.",
    maxMedia: "Max Media Size:",
    photoLimit: "PHOTO: 1MB",
    videoLimit: "VIDEO: 5MB",
    whatsappLabel: "WhatsApp (Country Code + Number)",
    whatsappPlaceholder: "Enter number",
    changeMedia: "Change Media",
    tryAnother: "Try another file",
    weight: "Size:",
    reduceSize: "Reduce Size",
    limitExceeded: "This file exceeds the synchronization limits.",
    compressNow: "Compress Now",
    syncNow: "Sync Now",
    syncing: "Uploading...",
    testLinkError: "Fix or sync media before testing the link.",
    defaultBadge: "PERFORMANCE",
    defaultTitle: "Your Title",
    defaultSub: "Descriptive subtitle.",
    
    defaultBtn: "Get in touch",
        hiddenToPublic: "Hidden from public",
    invalidPhoneDesc: "The button won't appear on the site until a valid WhatsApp number is provided. Solve it below in the control panel.",

    inventory_title: "Inventory",
    wpp_section_title: "Sales Channel",
    wpp_section_desc: "Set the official number to receive orders via WhatsApp.",
    whatsapp_placeholder: "84 000 0000",
    btn_new_product: "New Product",
    search_placeholder: "Search products...",
    status_active: "Active",
    status_paused: "Paused",
    
    

  stat_total: "Total Products",
  label_wpp_section_title: "Sales Channel",
  label_wpp_section_desc: "Set the WhatsApp number where you will receive customer orders.",
  placeholder_whatsapp: "Sales number",
  btn_save_whatsapp: "Save Number",
  error_invalid_phone: "Invalid number for this country.",
  placeholder_search: "Search by name, category, or price…",
  label_product: "Product",
  label_category: "Category",
  label_price: "Price",
  label_status: "Status",

  label_created_at: "Created at",
  label_actions: "Actions",
  view_product: "View",
  btn_edit: "Edit",



  product: "Product",
  price: "Price",
  status: "Status",
  actions: "Actions",
 
  no_products_found: "No products found",
  





  whatsapp_success: "WhatsApp updated successfully!",
  save_error: "Error saving",
  product_status_success: "Product status updated!",
  product_status_error: "Could not update product status.",
  save_button: "Save Changes",
  saving: "Saving...",
  

// Showcase Section
showcase_defaultCategory: "New Arrivals",
showcase_defaultTitle: "Our Collection",
showcase_defaultDescription: "Explore our curated selection of exclusive products with premium design and quality.",
showcase_maxPrice: "Max Price",
showcase_empty: "No products available",

// Common / UI
common_all: "All",
common_details: "Details",
common_loading: "Loading...",



showcase_clear_all: "Clear Filters",
    showcase_filter_active: "Active Filters",
    showcase_price_up_to: "Up to ${{price}}",
    showcase_category: "Category: {{category}}",
    filter_unlimited: "Unlimited",
    showcase_searchPlaceholder: "What are you looking for?",
    showcase_viewFull: "Browse All",
    common_close: "Close",
    common_filters: "Filters",


    product_details_visit_store: "Visit Store",
    product_details_details: "Details",
    product_details_final_value: "Final Value",
    product_details_confirm_whatsapp: "Confirm on WhatsApp",
    product_details_no_description: "No detailed description available for this product.",
    product_details_edit: "Edit",
    product_details_cancel: "Cancel",
    product_details_publish: "Publish",
    product_details_share_success: "Link copied!",
    common_category_general: "General",
    editor_limit_reached: "7 section limit reached",
  editor_limit_advice: "Remove blocks or create a new page to keep your site fast and organized.",

  
  editor_add_block: "Add Block",
  editor_back_to_layers: "Back to Layers",
  editor_structure_cols: "Structure (Columns)",
  editor_col_unit: "Col",
  editor_font_size: "Font Size",
  editor_font_small: "Small",
  editor_font_medium: "Medium",
  editor_font_large: "Large",
  editor_text_align: "Text Alignment",
  editor_theme_light: "LIGHT",
  editor_theme_dark: "DARK",
  editor_delete_block: "Delete Block",
  editor_layers_order: "Layers Order",
        


  templates_photography_label: "Fine Art Photography",
templates_photography_description: "See what you can do: transform a minimalist layout into your personal gallery with just a few clicks.",
templates_photography_hero_title: "Your Visual Narrative",
templates_photography_hero_sub: "A lean and sophisticated space for photographers who value every detail.",
templates_photography_gallery_empty_title: "Your New Collection",
templates_photography_gallery_empty_sub: "This gallery is ready for your vision. Start importing your photos.",
templates_photography_gallery_insp_title: "Inspiration and Aesthetics",
templates_photography_gallery_insp_sub: "Example of how the layout behaves with organic tones and soft light.",
templates_photography_contact_title: "Book a Session",

templates_saas_label: "Sales & Product",
templates_saas_description: "Results-oriented layout, highlighting products and subscription plans.",
templates_saas_hero_title: "Sell Smarter",
templates_saas_hero_sub: "The platform that unifies your stock, physical sales, and e-commerce in one place.",
templates_saas_pricing_title: "Our Plans",
templates_saas_features_title: "Enterprise Features",
templates_saas_contact_title: "Schedule a Demo",

templates_brand_label: "Personal Brand",
templates_brand_description: "Focused on establishing authority for mentors, speakers, and coaches.",
templates_brand_hero_title: "Turn Your Knowledge into Business",
templates_brand_hero_sub: "Positioning strategies for professionals aiming for the next level.",
templates_brand_stats_students: "STUDENTS",
templates_brand_stats_lives: "LIVES",
templates_brand_stats_countries: "COUNTRIES",
templates_brand_stats_roi: "ROI",
templates_brand_mentorship_title: "Mentorship Programs",
templates_brand_contact_title: "Talk to My Team",

templates_event_label: "Launch / Event",
templates_event_description: "Dynamic layout for product launches or major events.",
templates_event_hero_title: "The Future of Tech",
templates_event_hero_sub: "Join the biggest innovation event of the year. 24h of networking and insights.",
templates_event_speakers_title: "Confirmed Speakers",
templates_event_pricing_title: "Get Your Ticket (Early Bird)",
templates_event_contact_title: "Event Location",

templates_blank_label: "Empty Canvas",
templates_blank_description: "Start from scratch.",

common_best_seller: "Best Seller",
common_starter: "Starter",
common_limited_vagas: "Limited Spots",
currency_mt: "MT",
unit_per_month: "/month",


mobile_peek_tap_config: "Tap to configure",
mobile_drawer_close_hint: "Swipe down to close",
mobile_discard_changes: "Discard changes",

empty_state_title: "Your page is blank",
empty_state_description: "Turn this space into something amazing! Start by adding sections like galleries, heroes, or pricing tables.",
empty_state_action: "Tap the + button to get started",
editor_confirm_delete: "Are you sure you want to delete this block?",


sidebar_title: "Editing Panel",
sidebar_status_changed: "UNSAVED CHANGES",
sidebar_status_synced: "SITE SYNCED",
sidebar_button_publish: "PUBLISH NOW",
sidebar_button_saving: "PUBLISHING...",
sidebar_button_discard: "Discard Changes",

modal_library_title: "Block Library",
modal_library_add_action: "Add",
section_hero_comercial: "Commercial Hero",
section_galeria_grid: "Grid Gallery",
section_vitrine_produtos: "Product Showcase",
section_servicos_modern: "Modern Services",
section_contacto_mapa: "Contact & Map",
section_precos_moderno: "Pricing Table",
section_estatisticas_larga: "Statistics",
modal_library_subtitle: "Select a block to build",




  action_new_product: "New Product",
  action_new_product_sub: "Launch Catalog",
  action_create_page: "Create Page",
  action_create_page_sub: "Build Experience",
  
  // Sections & States
  section_catalog: "Product Catalog",
  manage_inventory: "Manage Inventory",
  section_paused: "Paused Items",
  page_home: "Landing Page",
  launch_sitemap: "Sitemap Dashboard",

  // Empty States
  empty_products_title: "Your stock is empty",
  empty_products_desc: "Add your first product to start selling.",
  btn_start_catalog: "Start Cataloging",
  empty_pages_title: "No pages created",
  empty_pages_desc: "Create pages to give your store an identity.",

  // Technical Footer
  footer_master_node: "Master Node",
  footer_uptime: "Uptime",
  uptime_active: "Active for",
  uptime_now: "Online Now",
  footer_store_key: "Store Key",
  no_contact: "No contact set",
  loading_engine: "Syncing Storely...",

  new_page: "NEW PAGE",
updated_status: "Updated",
deploy_now: "Deploy now",
new_deployment: "New Deployment",
configuring_page: "Configuring Page",
destination_path: "Destination Path",
required: "Required",
blueprint_arch: "Blueprint Architecture",
cancel: "Cancel",
search_page: "Search Pages...",
status_label: "Status",
operational: "Operational",
link_conflict: "Link duplicated. Please rename",
primary_infrastructure: "Primary Infrastructure (Home)",
empty_store_title: "Your Store is empty",
empty_state_desc: "Start building your digital presence. Create your first page using our professional blueprints.",
empty_search_title: "No results found",
empty_search_desc: "We couldn't find any page with that name.",
first_deploy_btn: "DEPLOY FIRST PAGE",




empty_search_description: "We couldn't find any pages with that name. Try another term or clear the search.",
primary_tag: "Primary",
link_copied: "Link copied!",
copy_error: "Error copying link",
design_btn: "DESIGN",
delete_confirm: "Are you sure you want to delete",
delete_error: "Error removing page",



page_deployed: "Page deployed successfully!",
limit_reached_message: "Limit of 10 pages reached!",
limit_error: "Maximum limit of 10 pages reached",
slug_error: "This path is already in use",
active_assets: "Active Pages",



settings_title: "General",
settings_highlight: "Settings",
settings_subtitle: "Security and Brand Identity",
tab_store: "Store",
tab_account: "Account",
tab_security: "Security",
section_presence_title: "Digital Presence",
section_presence_subtitle: "Your brand's public settings",
label_brand_name: "Brand Name",
label_slug: "Store URL (Slug)",
label_description: "Public Description",
label_whatsapp: "Contact WhatsApp",
section_email_title: "Access Email",
section_email_subtitle: "Manage your admin email",
label_current_email: "Current Address",
label_new_email: "New Email",
label_confirm_password: "Confirm with Current Password",
btn_update_email: "UPDATE EMAIL",
section_crypto_title: "Cryptography",
section_crypto_subtitle: "Protection and password change",
label_current_password: "Current Password",
label_new_password: "New Password",
label_repeat_password: "Repeat New Password",
btn_recovery_email: "RECOVER VIA EMAIL",
btn_change_password: "CHANGE PASSWORD",
loading_session: "Securing your session...",
edit_label: "EDIT",
save_success: "Change saved successfully!",
email_sent_success: "Link sent! Check your new inbox.",
password_update_success: "Your password has been updated successfully!",






branding: "Branding",
logotype: "Logotype",
upload_cleaning: "Cleaning previous...",
upload_ready: "Clean swap (Auto-delete)",
change_image: "Change Image",
sales_whatsapp: "Sales WhatsApp",
search_country: "Search country...",
not_defined: "Not defined",
save: "Save",
edit: "Edit",
short_description: "Short Description",
description_placeholder: "Click to add a description...",
description_textarea_placeholder: "Ex: The best shoe store in London...",
invalid_phone: "Invalid number for this country",
max_size: "Max 500KB",
file_too_large: "Image too large (Max 1MB).", 
compress_link: "Compress image here",


name_taken: "Name already taken!",
time_left: "left",
logout_btn: "Logout",
confirm_exit: "Exit now",
nav_dashboard: "Dashboard",
nav_pages: "My Pages",
nav_products: "Products",
nav_settings: "Settings",
update_success: "Store updated successfully!",
error_exiting: "Error exiting",


install_how_to: "How to install",
install_download_app: "Download app",
install_ios_alert: "On iPhone, open this in Safari and tap Share → Add to Home Screen.",
install_ios_helper: "Safari → Share → Home Screen",
install_use_supported_mobile_browser: "Use Chrome, Edge, or Samsung Internet",
install_use_supported_desktop_browser: "Use Chrome or Edge to install",
install_interact_to_enable: "Interact with the page to enable it",
install_open_help: "Tap to see how to install",
install_modal_title: "Install app",
install_browser_wait_prompt: "This browser supports installation, but the install prompt is not available yet. Reload the page and interact with it a bit before trying again.",
install_close: "Close",

  whatsappActive: "Active",
  whatsappNotConfigured: "Number not configured",
  goToSettingsToAddNumber: "Add the number in settings",
  whatsappNotConfiguredDesc: "No WhatsApp number configured. Go to store settings to activate the button.",

  },











































  pt: {
    // Navegação & UI
    nav_home: "Início",
    nav_blog: "Blog",
    nav_support: "Suporte",
    nav_privacy: "Privacidade",
    btn_dashboard: "Começar Agora",
    btn_close: "Fechar Menu",
    theme_light: "Claro",
    theme_dark: "Escuro",
    theme_auto: "Auto",
    theme_desc_night: "Ativado: Noite (18h-06h)",
    theme_desc_day: "Ativado: Dia (06h-18h)",
    menu_nav: "Navegação",
    language: "Idioma",
    footer_rights: "Direitos reservados",
    theme_desc_auto_base: "Muda sozinho conforme o horário.",
    theme_desc_manual: "Este modo permanecerá ativo até que você altere para Automático.",
    theme_click_toggle: "Clique para alternar",

    // Hero Section
    hero_title_1: "Construa",
    hero_title_2: "Seu",
    hero_title_3: "Website",
    hero_title_4: "Aqui.",
    hero_desc: "A plataforma definitiva para quem busca performance extrema.",
    hero_subtitle: "Sem código. Sem limites.",
    btn_gallery: "VER GALERIA",

    // Features
    feat_tag: "Funcionalidades",
    feat_title: "Tudo em um só lugar.",
    feat_1_title: "Editor Drag & Drop",
    feat_1_desc: "Construa visualmente sem tocar em uma linha de código. Simples, intuitivo e poderoso.",
    feat_2_title: "SEO Nativo",
    feat_2_desc: "Sua página já nasce otimizada para os motores de busca, garantindo melhor visibilidade.",
    feat_3_title: "Hospedagem Edge",
    feat_3_desc: "Sites carregados instantaneamente em qualquer lugar do mundo com nossa CDN premium.",

    // Showcase
    showcase_title_1: "Excelência em",
    showcase_title_2: "cada pixel.",
    showcase_desc: "Explore websites de alta performance criados por nossa comunidade de designers e empreendedores.",
    project_explore: "Explorar Website",
    proj_1_tag: "Motor E-commerce",
    proj_1_desc: "Uma infraestrutura de comércio eletrônico focada em velocidade de carregamento e conversão otimizada para o varejo moderno.",
    proj_2_tag: "Sistemas de Design",
    proj_2_desc: "Arquitetura de interface escalável, demonstrando a versatilidade de nossos componentes nativos e fidelidade visual.",

    // CTA
    cta_tag: "Acesso Instantâneo",
    cta_title_1: "Pronto para",
    cta_title_2: "dominar",
    cta_title_3: "a web?",
    cta_desc: "Junte-se a milhares de criadores e coloque seu projeto no ar em menos de 10 minutos.",
    cta_subtitle: "Sem custos ocultos.",
    btn_create_site: "CRIAR MEU SITE AGORA",
    cta_members: "+12k membros",

    // --- Novas Traduções da Galeria ---
    gallery_limit_error: "Resolva os erros para salvar",
    gallery_add: "Importar Mídia",
    gallery_support: "Imagens e vídeos (JPG, PNG, MP4)\n1 MB foto · 10 MB vídeo",
    gallery_file_error: "Erro de tamanho individual detectado",

    gallery_empty: "Comece com um upload",
    gallery_empty_sub: "Inicie a sequência via upload",
    gallery_compress: "Reduzir",
    gallery_preview_mode: "Modo de Pré-visualização",
    gallery_scanning: "Analisando Ativo...",
    gallery_weight: "Peso",
    gallery_limit_reached: "Cheio",
    gallery_slots: "Mídia",
    gallery_tutorial_title: "Combine suas melhores capturas em um layout profissional de alta performance.",
    gallery_limit_label: "Capacidade",
    gallery_items: "Itens",
    
    gallery_storage: "Armazenamento",
  gallery_action_blocked: "Ação Bloqueada",
  gallery_action_required: "Ação Necessária",
  gallery_btn_blocked: "Bloqueado",
  gallery_btn_sync: "Sincronizar",
  gallery_error_total_limit: "Remova arquivos (Máx 15MB)",
  gallery_error_individual: "Erro em arquivos específicos",
  gallery_pending_local: "Arquivos locais pendentes",
  gallery_msg_error: "Alguns arquivos estão com erro. Remova ou comprima os itens marcados em vermelho.",
  gallery_msg_ready: "Tudo pronto — sincronize para salvar. (Compressão opcional)",
  gallery_compress_images: "Comprimir imagens",
  gallery_compress_videos: "Comprimir vídeos",
  gallery_default_category: "Portfólio",
  gallery_default_title: "Minha Galeria",
  gallery_default_desc: "Clique para editar a descrição da sua galeria",
  gallery_tutorial_subtitle: "Galeria Vazia",
  gallery_type_photos: "Fotos",
  gallery_max_1mb: "Máx 1MB",
  gallery_type_videos: "Vídeo",
  gallery_max_10mb: "Máx 10MB",
  
  gallery_new_badge: "Novo",


        // editor

    editor_modal_save_title: "Publicar Site?",
    editor_modal_save_desc: "Deseja tornar estas alterações públicas para todos os visitantes?",
    editor_modal_discard_title: "Descartar tudo?",
    editor_modal_discard_desc: "Tem certeza? Perderá todas as edições feitas nesta sessão.",
    editor_modal_pending_media_title: "Mídias Pendentes!",
    editor_modal_pending_changes_title: "Mudanças Pendentes",
    editor_modal_nav_media_desc: "Você tem fotos ou vídeos que ainda estão apenas no seu computador. Se sair agora, eles serão excluídos!",
    editor_modal_nav_changes_desc: "Você tem alterações de texto ou layout não salvas. O que deseja fazer?",
    editor_modal_sync_warning: "Sincronize as mídias na galeria antes de publicar",
    editor_modal_btn_locked: "Bloqueado: Sincronize Mídias",
    editor_modal_btn_save: "Salvar e Publicar",
    editor_modal_btn_discard: "Descartar Mudanças",
    editor_modal_btn_discard_all: "Descartar e Perder Mídias",
    editor_modal_btn_continue: "Continuar Editando",


    limits: "Limite: {max} caracteres",
    uploading: "Enviando para nuvem...",
    mediaSaved: "Mídia salva!",
    saveError: "Erro ao salvar.",
    maxMedia: "Mídia Máxima:",
    photoLimit: "FOTO: 1MB",
    videoLimit: "VÍDEO: 5MB",
    whatsappLabel: "WhatsApp (DDI + Número)",
    whatsappPlaceholder: "Número com DDD",
    
    changeMedia: "Trocar Mídia",
    tryAnother: "Tentar outro arquivo",
    weight: "Peso:",
    reduceSize: "Reduzir Tamanho",
    limitExceeded: "Este arquivo ultrapassa os limites permitidos para sincronização.",
    compressNow: "Comprimir Agora",
    syncNow: "Sincronizar Agora",
    syncing: "Enviando...",
    testLinkError: "Corrija ou sincronize a mídia antes de testar o link.",
    defaultBadge: "PERFORMANCE",
    defaultTitle: "Seu Título",
    defaultSub: "Subtítulo descritivo.",
    
    defaultBtn: "Iniciar contacto",   
    hiddenToPublic: "Invisível para o público",
    invalidPhoneDesc: "O botão não aparecerá no site até que o número de WhatsApp seja válido. Solucione abaixo no painel de controle.",

    inventory_title: "Inventário",
    wpp_section_title: "Canal de Vendas",
    wpp_section_desc: "Configure o número oficial para receber pedidos via WhatsApp.",
    whatsapp_placeholder: "84 000 0000",
    btn_new_product: "Novo Produto",
    search_placeholder: "Pesquisar produtos...",
    status_active: "Ativo",
    status_paused: "Pausado",



  
  stat_total: "Total de Produtos",
  label_wpp_section_title: "Canal de Vendas",
  label_wpp_section_desc: "Configure o número de WhatsApp que receberá os pedidos dos clientes.",
  placeholder_whatsapp: "Número de vendas",
  btn_save_whatsapp: "Salvar Número",
  error_invalid_phone: "Número inválido para este país.",
  
  placeholder_search: "Pesquisar por nome, categoria ou preço...",
  label_product: "Produto",
  label_category: "Categoria",
  label_price: "Preço",
  label_status: "Status",

  label_created_at: "Criado em",
  label_actions: "Ações",
  btn_view_product: "Ver",
  view_product: "Ver",
  btn_edit: "Editar",



  product: "Produto",
price: "Preço",
status: "Status",
actions: "Ações",



whatsapp_success: "WhatsApp atualizado com sucesso!",
save_error: "Erro ao salvar",
product_status_success: "Status do produto atualizado!",
product_status_error: "Não foi possível alterar o status do produto.",
save_button: "Salvar Alterações",
saving: "Salvando...",


no_products_found: "Nenhum produto encontrado",

showcase_defaultCategory: "Lançamentos",
    showcase_defaultTitle: "Nossa Coleção",
    showcase_defaultDescription: "Explore produtos selecionados com design exclusivo e qualidade premium para você.",
    showcase_searchPlaceholder: "Buscar na vitrine...",
    showcase_maxPrice: "Preço Máx.",
    showcase_empty: "Nenhum produto disponível",
    
    // Common / UI
    common_all: "Todos",
    common_details: "Detalhes",
    common_loading: "Carregando...",
    showcase_clear_all: "Limpar Filtros",
    showcase_filter_active: "Filtros Ativos",
    showcase_price_up_to: "Até R$ {{price}}",
    showcase_category: "Categoria: {{category}}",
    filter_unlimited: "Ilimitado",
    showcase_viewFull: "Ver Tudo",
    
      common_close: "Fechar",
      common_filters: "Filtros",



      product_details_visit_store: "Ver Loja",
  product_details_details: "Detalhes",
  product_details_final_value: "Valor Final",
  product_details_confirm_whatsapp: "Confirmar no WhatsApp",
  product_details_no_description: "Produto sem descrição detalhada disponível no momento.",
  product_details_edit: "Editar",
  product_details_cancel: "Cancelar",
  product_details_publish: "Publicar",
  product_details_share_success: "Link copiado!",
  common_category_general: "Geral",
      
    editor_limit_reached: "Limite de 7 seções atingido",
  editor_limit_advice: "Remova blocos ou crie uma nova página para manter o site rápido e organizado.",

  editor_add_block: "Adicionar Bloco",
  editor_back_to_layers: "Voltar às Camadas",
  editor_structure_cols: "Estrutura (Colunas)",
  editor_col_unit: "Col",
  editor_font_size: "Tamanho do Texto",
  editor_font_small: "Pequeno",
  editor_font_medium: "Médio",
  editor_font_large: "Grande",
  editor_text_align: "Alinhamento de Texto",
  editor_theme_light: "CLARO",
  editor_theme_dark: "ESCURO",
  editor_delete_block: "Eliminar Bloco",
  editor_layers_order: "Ordem das Camadas",



  templates_photography_label: "Fine Art Photography",
templates_photography_description: "Olha o que você pode fazer: transforme um layout minimalista na sua galeria pessoal com apenas alguns cliques.",
templates_photography_hero_title: "A Sua Narrativa Visual",
templates_photography_hero_sub: "Um espaço enxuto e sofisticado para fotógrafos que valorizam cada detalhe.",
templates_photography_gallery_empty_title: "Sua Nova Coleção",
templates_photography_gallery_empty_sub: "Esta galeria está pronta para receber seu olhar. Comece a importar suas fotos.",
templates_photography_gallery_insp_title: "Inspiração e Estética",
templates_photography_gallery_insp_sub: "Exemplo de como o layout se comporta com tons orgânicos e luz suave.",
templates_photography_contact_title: "Agende um Ensaio",






templates_saas_label: "Vendas & Produto",
templates_saas_description: "Layout orientado a resultados, destacando produtos e planos de assinatura.",
templates_saas_hero_title: "Venda Mais com Inteligência",
templates_saas_hero_sub: "A plataforma que unifica seu estoque, vendas físicas e e-commerce em um só lugar.",
templates_saas_pricing_title: "Nossos Planos",
templates_saas_features_title: "Funcionalidades Enterprise",
templates_saas_contact_title: "Agende uma Demonstração",

templates_brand_label: "Marca Pessoal",
templates_brand_description: "Focado em estabelecer autoridade para mentores, palestrantes e coaches.",
templates_brand_hero_title: "Transforme seu Conhecimento em Negócio",
templates_brand_hero_sub: "Estratégias de posicionamento para profissionais que buscam o próximo nível.",
templates_brand_stats_students: "ALUNOS",
templates_brand_stats_lives: "LIVES",
templates_brand_stats_countries: "PAÍSES",
templates_brand_stats_roi: "ROI",
templates_brand_mentorship_title: "Programas de Mentoria",
templates_brand_contact_title: "Fale com minha Equipe",

templates_event_label: "Lançamento / Evento",
templates_event_description: "Layout dinâmico para lançamentos de produtos ou grandes eventos.",
templates_event_hero_title: "O Futuro da Tech em Maputo",
templates_event_hero_sub: "Participe do maior evento de inovação do ano. 24h de networking e insights.",
templates_event_speakers_title: "Speakers Confirmados",
templates_event_pricing_title: "Garanta seu Ticket (Lote 1)",
templates_event_contact_title: "Localização do Evento",

templates_blank_label: "Tela em Branco",
templates_blank_description: "Comece do zero.",

common_best_seller: "Mais Vendido",
common_starter: "Iniciante",
common_limited_vagas: "Vagas Limitadas",
currency_mt: "MT",
unit_per_month: "/mês",



mobile_peek_tap_config: "Tocar para configurar",
mobile_drawer_close_hint: "Deslize para fechar",
mobile_discard_changes: "Descartar as mudanças",
editor_confirm_delete: "Tem certeza que deseja excluir este bloco?",

empty_state_title: "Sua página está em branco",
empty_state_description: "Transforme este espaço em algo incrível! Comece adicionando seções como galerias, cabeçalhos ou tabelas de preços.",
empty_state_action: "Toque no botão + para começar",


sidebar_title: "Painel de Edição",
sidebar_status_changed: "MODIFICAÇÕES ATIVAS",
sidebar_status_synced: "SITE SINCRONIZADO",
sidebar_button_publish: "PUBLICAR AGORA",
sidebar_button_saving: "PUBLICANDO...",
sidebar_button_discard: "Descartar Mudanças",

modal_library_title: "Biblioteca de Blocos",
modal_library_add_action: "Adicionar",
section_hero_comercial: "Banner Comercial",
section_galeria_grid: "Galeria Grid",
section_vitrine_produtos: "Vitrine de Produtos",
section_servicos_modern: "Serviços Modernos",
section_contacto_mapa: "Contacto e Mapa",
section_precos_moderno: "Tabela de Preços",
section_estatisticas_larga: "Estatísticas",
modal_library_subtitle: "Selecione um bloco para construir",






  action_new_product: "Novo Produto",
  action_new_product_sub: "Lançar Catálogo",
  action_create_page: "Criar Página",
  action_create_page_sub: "Construir Experiência",
  
  // Seções e Estados
  section_catalog: "Catálogo de Produtos",
  manage_inventory: "Gerenciar Inventário",
  section_paused: "Itens Pausados",
  page_home: "Página Principal",
  launch_sitemap: "Painel de Páginas",

  // Empty States
  empty_products_title: "Seu estoque está vazio",
  empty_products_desc: "Adicione seu primeiro produto para começar a vender.",
  btn_start_catalog: "Começar Cadastro",
  empty_pages_title: "Nenhuma página criada",
  empty_pages_desc: "Crie páginas para dar identidade à sua loja.",

  // Footer Técnico
  footer_master_node: "Master Node",
  footer_uptime: "Uptime",
  uptime_active: "Ativa há",
  uptime_now: "Online Agora",
  footer_store_key: "Store Key",

  no_contact: "Contato não definido",
loading_engine: "Sincronizando Storely...",





new_page: "NOVA PÁGINA",
updated_status: "Actualizado",
deploy_now: "Publicar agora",
new_deployment: "Nova Implementação",
configuring_page: "Configurando Página",
destination_path: "Caminho de Destino",
required: "Obrigatório",
blueprint_arch: "Arquitectura do Blueprint",
cancel: "Cancelar",
search_page: "Pesquisar Páginas...",
status_label: "Estado",
operational: "Operacional",
link_conflict: "Link duplicado. Por favor mude o nome",
primary_infrastructure: "Infraestrutura Principal (Home)",
empty_store_title: "Sua Loja está vazia",
empty_state_desc: "Comece a construir sua presença digital. Crie sua primeira página usando nossos blueprints profissionais.",
empty_search_title: "Nenhum resultado encontrado",
empty_search_desc: "Não encontramos nenhuma página com esse nome.",
first_deploy_btn: "DEPLOY PRIMEIRA PÁGINA",

empty_search_description: "Não encontramos nenhuma página com esse nome. Tente outro termo ou limpe a busca.",


primary_tag: "Principal",
link_copied: "Link copiado!",
copy_error: "Erro ao copiar link",
design_btn: "DESIGN",
delete_confirm: "Tem certeza que deseja excluir",
delete_error: "Erro ao remover página",

page_deployed: "Página publicada com sucesso!",
limit_reached_message: "Limite de 10 páginas atingido!",
limit_error: "Você atingiu o limite máximo de 10 páginas",
slug_error: "Este caminho (URL) já está em uso",
active_assets: "Páginas Ativas",


store_name_label: "Nome da Loja",
store_slug_label: "Link da Loja (URL)",
store_desc_label: "Descrição Curta",
whatsapp_label: "WhatsApp de Suporte",
visual_title: "VISUAL DA LOJA",
uploading_text: "CARREGANDO...",
change_logo_btn: "MUDAR LOGO",




settings_title: "Definições",
settings_highlight: "Gerais",
settings_subtitle: "Segurança e Identidade da Marca",
tab_store: "Loja",
tab_account: "Conta",
tab_security: "Segurança",
section_presence_title: "Presença Digital",
section_presence_subtitle: "Configurações públicas da sua marca",
label_brand_name: "Nome da Marca",
label_slug: "URL da Loja (Slug)",
label_description: "Descrição Pública",
label_whatsapp: "WhatsApp de Contacto",
section_email_title: "E-mail de Acesso",
section_email_subtitle: "Gerencie seu e-mail administrativo",
label_current_email: "Endereço Atual",
label_new_email: "Novo E-mail",
label_confirm_password: "Confirmar com Senha Atual",
btn_update_email: "ATUALIZAR E-MAIL",
section_crypto_title: "Criptografia",
section_crypto_subtitle: "Proteção e troca de senha",
label_current_password: "Senha Atual",
label_new_password: "Nova Senha",
label_repeat_password: "Repetir Nova Senha",
btn_recovery_email: "RECUPERAR VIA E-MAIL",
btn_change_password: "ALTERAR SENHA",
loading_session: "Protegendo sua sessão...",
edit_label: "ALTERAR",
save_success: "Alteração salva com sucesso!",
email_sent_success: "Link enviado! Verifique sua nova caixa de entrada.",
password_update_success: "Sua senha foi atualizada com sucesso!",




branding: "Branding",
logotype: "Logotipo",
upload_cleaning: "A limpar anterior...",
upload_ready: "Troca limpa (Auto-delete)",
change_image: "Trocar Imagem",
sales_whatsapp: "WhatsApp de Vendas",
search_country: "Pesquisar país...",
not_defined: "Não definido",
save: "Guardar",
edit: "Editar",
short_description: "Descrição Curta",
description_placeholder: "Clique para adicionar uma descrição...",
description_textarea_placeholder: "Ex: A melhor loja de sapatos de Lisboa...",
invalid_phone: "Número inválido para este país",
max_size: "Máximo 500KB",

file_too_large: "Imagem muito grande (Máx 1MB).", 
compress_link: "Comprimir imagem aqui",




name_taken: "Nome indisponível!",
time_left: "restante",
logout_btn: "Logout",
confirm_exit: "Sair agora",
nav_dashboard: "Dashboard",
nav_pages: "Minhas Páginas",
nav_products: "Produtos",
nav_settings: "Configurações",
update_success: "Loja atualizada com sucesso!",
error_exiting: "Erro ao sair",



install_how_to: "Como instalar",
install_download_app: "Baixar app",
install_ios_alert: "No iPhone, abra no Safari e toque em Partilhar → Adicionar ao ecrã principal.",
install_ios_helper: "Safari → Partilhar → Ecrã principal",
install_use_supported_mobile_browser: "Use Chrome, Edge ou Samsung Internet",
install_use_supported_desktop_browser: "Use Chrome ou Edge para instalar",
install_interact_to_enable: "Interaja com a página para ativar",
install_open_help: "Toque para ver como instalar",
install_modal_title: "Instalar aplicação",
install_browser_wait_prompt: "Este navegador suporta instalação, mas o aviso ainda não apareceu. Recarregue a página e interaja um pouco antes de tentar novamente.",
install_close: "Fechar",

  whatsappActive: "Ativo",
  whatsappNotConfigured: "Número não configurado",
  goToSettingsToAddNumber: "Adicione o número nas configurações",
  whatsappNotConfiguredDesc: "Sem número de WhatsApp configurado. Vá às configurações da loja para ativar o botão.",

  }
} as const;

export type Language = 'en' | 'pt';
export type TranslationKeys = keyof typeof translations['en'];