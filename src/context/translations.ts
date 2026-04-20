// Separamos os dados para não disparar re-renders desnecessários no HMR
export const translations = {
  en: {
    // Navigation & UI
    nav_home: "Explore",
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
    changeMedia: "Change Photo",
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


section_texto_imagem_showcase: "Text Mosaic",
section_texto_narrativo: "Text Block",
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





































  aboutBadge: "About",
aboutTitle: "My Approach: Passion and Precision",
aboutSubtitle: "A clear, modern vision focused on results.",
aboutDescription: "My journey in the digital world started with curiosity and the desire to build useful solutions. Today, I combine creativity, method, and attention to detail to deliver modern, clear, and efficient experiences.",
aboutSecondaryTitle: "Who I Am",
aboutSecondaryDescription: "I am a professional focused on building well-structured, responsive digital solutions designed to grow with quality.",

textSectionSimpleHelp: "Edit the texts. The limits already help keep the layout clean.",
imageSectionSimpleHelp: "Edit the texts and choose a photo. Then click confirm.",
fillBadge: "Write a short badge",
fillMainTitle: "Write the title",
fillSubtitle: "Write the subtitle",
fillDescription: "Write the description",
fillSecondaryTitle: "Write the secondary title",
fillSecondaryDescription: "Write the secondary text",
defaultImageAlt: "Section image",

uploadPhoto: "Upload photo",
confirmPhoto: "Confirm photo",
savingPhoto: "Saving...",
removePhoto: "Remove photo",















  processing: 'Processing...',
  adjustPhoto: 'Adjust photo',
  cropApplied: 'Crop applied successfully.',
  imageSavedSuccess: 'Image uploaded successfully.',
  imageUploadError: 'Failed to upload image.',
  imageRemoved: 'Image removed successfully.',
  imageRemoveError: 'Failed to remove image.',
  uploadSuccess: 'Upload completed successfully.',
  uploadError: 'Failed to upload file.',
  fileReadError: 'Error reading file. Please try again.',
  imageTypeError: 'Please select a valid image.',
  imageTooLargeMustCompress: 'Image is above the limit. Compress it before uploading.',
  compressPhotoLink: 'Compress image',
  choosePhoto: 'Choose photo',
  changePhoto: 'Change photo',
 
  movePhoto: 'Move photo',
  imageWeight: 'Size',
  imageSizeLimit: 'Maximum size: {{size}} MB',
  defaultImage: 'Default image',
  
  editor_modal_sync_required: 'Synchronization required',


  imageTooLargeCropBlocked: 'Cannot apply crop to an image above the limit.',
saveBlockedPendingSection: 'Action blocked: section {{section}} has pending or oversized uploads.',
savingPage: 'Saving page...',
publishedSuccess: 'Published successfully!',
publishError: 'Error while publishing.',











  cropError: "Error applying crop",
  applyCrop: "Apply crop",
  sectionsNeedSaving:"Sections pending to be saved",
  imageSelectedConfirmToSave:"Image selected. Confirm to save.",
  imageReadyConfirmHelp:"The image has been selected. Now click confirm image to save it.",

  clickToEdit: "Click to edit",
  tapToEdit: "Tap to edit",
  editingSection: "Editing",
  loadingEditor: "Loading editor...",
  waitingAddressesLoad: "Waiting for addresses to load...",
    imageSelectionCancelled: "Image selection cancelled",





    cacheLabel: "cache",
  cacheStatusLocal: "local",
  cacheStatusNetwork: "network",
  cacheStatusWaiting: "waiting",
  cacheStatusSyncing: "syncing",

  invalid_store_name: "Invalid store name",
    blockDefaultName: "BLOCK",



  marketplace_product_fallback: "Product",
marketplace_general: "General",
marketplace_store_fallback: "Store",
marketplace_store_default_description: "Discover products and updates from this store.",
marketplace_all_categories: "All categories",
marketplace_all_stores: "All stores",
marketplace_new_products: "New products",
marketplace_more_new_products: "More new products",
marketplace_available_stores: "Available stores",
marketplace_more_stores: "More stores to explore",
marketplace_start_selling_title: "Start selling on Storely",
marketplace_start_selling_subtitle: "Create your account and start publishing products in a fast, modern, professional marketplace.",
marketplace_start_selling_cta: "Create account",
marketplace_search_placeholder: "Search marketplace",
marketplace_suggestions: "Suggestions",
marketplace_recent_searches: "Recent searches",
marketplace_explore: "Explore",
marketplace_sell_now: "Sell now",
marketplace_clear_filters: "Clear filters",
marketplace_view_store: "View store",
marketplace_main_feed: "Main feed",
marketplace_hero_title_line_1: "Discover products,",
marketplace_hero_title_line_2: "stores, and smart suggestions",
marketplace_hero_explore: "Explore marketplace",
marketplace_hero_sell: "I want to sell",
marketplace_hero_smart_block: "Smart search and recommendations",
marketplace_showcase_title: "Community marketplace",
marketplace_showcase_subtitle: "Products, stores, and suggestions.",






marketplace_related_products: "Related products",
marketplace_related_stores: "Related stores",
marketplace_search_products: "Found products",
marketplace_search_stores: "Found stores",


marketplace_search_exact: "Exact result",
marketplace_search_approximate: "Approximate result",
marketplace_search_related: "Related results",
marketplace_search_fallback: "Marketplace suggestions",
marketplace_cache: "cache",
marketplace_cache_expired: "expired",
marketplace_syncing: "syncing",
marketplace_refresh_cache: "refresh cache",
marketplace_not_found_title: "Nothing very close was found",
marketplace_not_found_subtitle: "Try another name, category, or store. You can also choose one of the suggestions below.",
marketplace_try_these: "Try these",























storely_product_fallback: "Product",
storely_general: "General",
storely_store_fallback: "Store",
storely_store_default_description: "Discover products and updates from this store.",
storely_all_categories: "All categories",
storely_all_stores: "All stores",
storely_new_products: "New on Storely",
storely_more_new_products: "More new finds",
storely_available_stores: "Stores on Storely",
storely_more_stores: "More stores to explore",
storely_related_products: "Related products",
storely_related_stores: "Related stores",
storely_matching_stores: "Matching stores",
storely_similar_stores: "Similar stores",
storely_more_like_this: "More like this",
storely_exact_matches: "Exact matches",
storely_close_matches: "Close matches",
storely_suggestions_for_you: "Suggestions for you",
storely_start_selling_title: "Start selling on Storely",
storely_start_selling_subtitle: "Create your account and publish products in a fast, beautiful, smart way.",
storely_start_selling_cta: "Create account",
storely_search_placeholder: "Search Storely",
storely_suggestions: "Suggestions",
storely_recent_searches: "Recent searches",
storely_explore: "Explore",
storely_sell_now: "Sell now",
storely_clear_filters: "Clear filters",
storely_view_store: "View store",
storely_main_feed: "Main feed",
storely_search_exact: "Exact result",
storely_search_approximate: "Approximate result",
storely_search_related: "Related results",
storely_search_fallback: "Storely suggestions",
storely_cache: "cache",
storely_cache_expired: "expired",
storely_syncing: "syncing",
storely_refresh_cache: "refresh",
storely_not_found_title: "Nothing very close was found",
storely_not_found_subtitle: "Try another name, category, or store. You can also choose one of the suggestions below.",











storely_search_no_exact_but_close: "No exact result, but there are close matches",
storely_search_no_exact_but_related: "No exact result, but there are related results",
storely_search_nothing_close: "Nothing very close, but there are suggestions for you",
storely_search_message_close: "I could not find an exact name, but here are the closest matches that may help you.",
storely_search_message_related: "I could not find an exact result, but I selected related things you may like.",



storely_search_empty_title: "No results found",
storely_search_empty_subtitle: "We couldn't find anything matching your search. Try a different word or explore other products below.",
storely_search_message_fallback: "We didn't find anything close, but here are some suggestions you might like.",
storely_other_products_we_have: "Other products we have",
storely_try_these: "Try searching for:",






marketplace_hero_badge: "Discover more in one place",
marketplace_hero_subtitle: "Explore a marketplace with multiple types of products and shops in one simple, fast and organized experience.",
marketplace_hero_point_products: "Different product types",
marketplace_hero_point_stores: "Multiple stores",
marketplace_hero_point_discover: "Easy to explore",
storely_cta_title: "Start selling your products today",
storely_cta_subtitle: "Create your store, showcase your products and reach more customers in one simple platform.",


















product_form_create_title: "Create product",
product_form_edit_title: "Edit product",
product_form_intro: "Fill in the essentials without getting lost. First images, then price, category, and description.",
product_form_cover: "COVER",
product_form_add_cover: "Add cover",
product_form_add_image: "Add image",
product_form_image_help: "Use up to 4 images. The first one is the cover. Each image must be 1MB or less.",
product_form_image_too_large: "Image is too large. Use 1MB or less.",
product_form_name_label: "Name",
product_form_name_placeholder: "What are you selling?",
product_form_price_label: "Price",
product_form_price_whole: "Value",
product_form_price_cents: "Cents",
product_form_price_help: "The value is separated from the cents to avoid confusion. Example: 4 and 00 becomes 4.00.",
product_form_category_label: "Category",
product_form_category_placeholder: "Example: Furniture",
product_form_unit_label: "Unit of measure",
product_form_unit_un: "Unit",
product_form_unit_par: "Pair",
product_form_unit_kit: "Kit",
product_form_unit_pacote: "Pack",
product_form_unit_caixa: "Box",
product_form_unit_kg: "Kilogram",
product_form_unit_g: "Gram",
product_form_unit_l: "Liter",
product_form_unit_ml: "Milliliter",
product_form_unit_m: "Meter",
product_form_unit_cm: "Centimeter",
product_form_unit_m2: "Square meter",
product_form_unit_m3: "Cubic meter",
product_form_unit_hora: "Hour",
product_form_unit_dia: "Day",
product_form_unit_semana: "Week",
product_form_unit_mes: "Month",
product_form_unit_servico: "Service",
product_form_description_label: "Description",
product_form_description_placeholder: "Explain the product in a simple, clear, and useful way.",
product_form_description_help: "Focus on what helps the customer decide: size, material, color, usage, or condition.",
product_form_pending_title: "Still incomplete",
product_form_ready_title: "Ready to save",
product_form_ready_subtitle: "The main data has been filled in correctly.",
product_form_pending_name: "Name",
product_form_pending_category: "Category",
product_form_pending_price: "Price",
product_form_pending_cover: "Cover",
product_form_pending_images: "Images",
product_form_create_action: "Publish",
product_form_save_action: "Save",
product_form_created_success: "Product created successfully.",
product_form_updated_success: "Product updated successfully.",
product_form_save_error: "Could not save the product.",
product_form_store_not_found: "Admin store not found.",
product_form_product_not_found: "Product not found.",
product_form_error_name_required: "Add a name for the product.",
product_form_error_name_short: "The name is still too short.",
product_form_error_category_required: "Choose or type a category.",
product_form_error_price_required: "Set a price for the product.",
product_form_error_price_invalid: "The price must be greater than zero.",
product_form_error_cover_required: "Add a cover image.",
product_form_error_images_invalid: "Some images have size issues.",
product_form_image_delete_error: "Could not delete the temporary image.",
storely_search: "Search",
storely_all: "All",
storely_clear: "Clear",

store_currency_section_title: "Store currency",
store_currency_section_desc: "On the first time, we automatically detect the most likely currency based on the device and save it if the store does not have one yet.",
store_currency_detected_label: "Detected",
store_currency_save_success: "Currency saved successfully.",
store_currency_save_error: "Error saving currency.",
store_products_empty: "No products found.",








product_form_image_removed_cloud: "Image removed from the cloud and the form.",
product_form_image_removed_local: "Image removed from the form.",
product_form_image_removed_local_only_after_cloud_fail: "Image removed only from the form. Cloud deletion failed.",
















product_form_image_replaced_cloud: "Previous image deleted from the cloud and replaced in the form.",
product_form_image_replaced_local: "Image replaced in the form.",
product_form_image_replaced_local_only_after_cloud_fail: "Image replaced in the form, but the previous one could not be deleted from the cloud.",
product_form_image_replace_error: "Could not replace the image.",


clearCache : "Clear cache",
cacheClearedSuccess : "Cache cleared successfully.",
cacheClearedError : "Error clearing cache.",
cache_refresh_success : "Cache refreshed successfully.",
cache_refresh_error : "Error refreshing cache.",





new_product: "New product",
  product_details_share_text: "Check out this product:",
  product_details_whatsapp_unavailable: "The store WhatsApp number is not available.",
  product_details_order_message_intro: "Hello, I want to order this product:",
  product_details_quantity: "Quantity",
  product_details_total: "Total",
 


  storely_found_products: "Products found",


storely_categories: "Categories",

storely_products: "products",
storely_stores: "stores",

storely_sell_cta_title: "Start selling with your own store",
storely_sell_cta_subtitle: "Create your store, showcase your products, and reach more people beautifully.",
storely_no_results_title: "No results found",
storely_no_results_subtitle: "Try another name, category, or store to discover more products.",







    product_details_order_message_buyer_hint: "I would like more details and current availability.",
    product_details_order_message_product: "Product",
    product_details_order_message_unit_price: "Unit price",
    product_details_order_message_quantity: "Quantity",
    product_details_order_message_total: "Total",
    product_details_order_message_store: "Store",
    product_details_order_message_closing: "Can you confirm whether it is still available?",
    product_details_cta_badge: "Quick purchase",
    product_details_cta_title: "Liked this product?",
    product_details_cta_subtitle: "Talk to the store now and confirm availability, price, and delivery in seconds.",
    product_details_price_label: "Price per unit",
    product_details_quantity_label: "Choose quantity",
    product_details_gallery_open: "Open image",
    product_details_image_counter: "{{current}} of {{total}}",
    product_details_about_product: "About this product",

    product_form_unit_rosas:"Unit of measure format",








   










    auth_brand: "Storely",
    auth_support: "Support",
    auth_callback_success: "Authentication completed successfully.",
    auth_callback_error: "Could not complete authentication.",
    auth_callback_title: "Finishing authentication",
    auth_callback_desc: "Please wait while we securely return you to Storely.",
    auth_enter_email_first: "Enter your email first.",
    auth_reset_email_sent: "Password reset email sent.",
    auth_reset_email_error: "Failed to send password reset email.",
    auth_store_required: "Please enter your store name.",
    auth_store_invalid: "Please enter a valid store name.",
    auth_slug_min_chars: "Use at least 3 characters.",
    auth_slug_invalid_chars: "Use only lowercase letters, numbers and hyphens.",
    auth_slug_reserved: "This store name is not available.",
    auth_slug_checking: "Checking store name...",
    auth_slug_taken: "This store name already exists.",
    auth_slug_available: "Store name is available.",
    auth_slug_wait: "Please wait while we check the store name.",
    auth_user_missing: "User account was created, but user data is missing.",
    auth_signup_success: "Account created successfully.",
    auth_login_success: "Welcome back.",
    auth_generic_error: "Something went wrong. Please try again.",
    auth_desktop_big_title_line1: "BUILD YOUR",
    auth_desktop_big_title_line2: "DIGITAL",
    auth_desktop_big_title_line3: "STORE",
    auth_desktop_subtitle_compact: "Simply, quickly, and for free. Start selling today with the best platform for entrepreneurs.",
    auth_desktop_point_1: "Instant Configuration",
    auth_desktop_point_2: "Intuitive Admin Panel",
    auth_desktop_point_3: "Expert Support",
    auth_mobile_title_line1: "Create your",
    auth_mobile_title_line2: "digital store",
    auth_mobile_subtitle_professional: "Start selling with a professional access experience designed for mobile and desktop.",
    auth_create_account: "Create account",
    auth_login: "Login",
    auth_start_here: "Start here",
    auth_welcome_back_small: "Welcome back",
    auth_heading_signup: "Create your account",
    auth_heading_login: "Sign in to Storely",
    auth_signup_description_professional: "Enter your email, password and store name to start your store professionally.",
    auth_login_description_professional: "Use your email and password to continue to your dashboard securely.",
    auth_error_title: "Something went wrong",
    auth_email_label: "Email",
    auth_email_placeholder: "name@email.com",
    auth_store_name_label: "Store name",
    auth_store_name_placeholder: "Ex: Luxury Boutique",
    auth_store_url_preview: "URL",
    auth_password_label: "Password",
    auth_forgot_password: "Forgot password?",
    auth_forgot_title: "Recover your access",
    auth_forgot_description: "Enter your email and we will send you a secure link to create a new password.",
    auth_send_reset_link: "Send reset link",
    auth_recovery_label: "Recovery",
    auth_or: "or",
    auth_switch_login_title: "Already have an account?",
    auth_switch_signup_title: "Need a new store account?",
    auth_go_to_login: "Go to login",
    auth_go_to_signup: "Create account first",
    auth_account_found_title: "Account found",
    auth_existing_email_go_login: "This email is already registered. Please continue through login.",
    auth_existing_store_go_login: "This store name is already in use. If it is yours, please continue through login.",
    auth_remembered_password: "Remembered your password?",
    auth_back_to_login: "Back to login",
    auth_reset_invalid_link: "Invalid or expired recovery link.",
    auth_reset_fill_both: "Fill in both password fields.",
    auth_reset_password_mismatch: "Passwords do not match.",
    auth_reset_password_short: "Password must be at least 6 characters.",
    auth_reset_success: "Password updated successfully.",
    auth_reset_save_error: "Could not update password.",
    auth_reset_label: "Recovery",
    auth_reset_title: "Reset password",
    auth_reset_description: "Create a new password for your Storely account.",
    auth_reset_new_password: "New password",
    auth_reset_confirm_password: "Confirm password",
    auth_reset_save_password: "Save new password",

    auth_callback_loading_message: "Validating your credentials...",
    auth_callback_loading_title: "Checking access",
    auth_callback_success_title: "Verified",
    auth_callback_error_title: "Access error",
    auth_callback_redirecting: "Redirecting...",
    auth_callback_back_login: "Back to login",
    auth_callback_link_error: "This link has expired or has already been used.",
    auth_callback_recovery_success: "Identity confirmed. Let's create your new password.",
    auth_callback_email_change_success: "Email verified successfully. Your account has been updated.",
    auth_callback_login_success: "Authentication completed successfully.",
    auth_callback_no_session: "We could not validate your session. Please try again.",
    auth_callback_generic_error: "Could not complete authentication.",

    auth_password_min_length: "Password must be at least 6 characters.",
    auth_password_hint_min: "Minimum 6 characters.",
    auth_show_password: "Show password",
    auth_hide_password: "Hide password",

    auth_signup_description_short: "Use your email, password and store name to get started.",
    auth_login_description_short: "Sign in securely to continue to your dashboard.",
    auth_side_title_1: "Smart store name check",
    auth_side_text_1: "Store name verification uses debounce and cache to reduce unnecessary reads and keep API usage efficient.",
    auth_side_title_2: "Secure recovery flow",
    auth_side_text_2: "Password recovery returns the user directly to Storely so a new password can be created safely.",


        auth_store_name_length_invalid: "Store name must be between 2 and 40 characters.",








        security_recovery_title: "Reset Password",
security_recovery_subtitle: "Create a new secure password for your account.",
security_recovery_mode_active: "Recovery Mode Active",
security_current_password: "Current Password",
security_new_password: "New Password",
security_confirm_password: "Repeat Password",
security_password_min_error: "Password must be at least 6 characters.",
security_password_min_hint: "Minimum 6 characters.",
security_passwords_not_match: "Passwords do not match.",
security_current_password_required: "Enter your current password.",
security_current_password_incorrect: "Current password is incorrect.",
security_email_missing: "No email found for this account.",
security_reset_success: "Password reset successfully!",
security_reset_email_sent: "Reset email sent successfully!",
security_reset_email_error: "Failed to send reset email.",
security_sending_email: "Sending...",
security_forgot_password: "Forgot my password",
security_save_new_password: "Save New Password",







store_header_page_fallback: "Page",
store_header_store_fallback: "Store",
store_header_menu: "Menu",
store_header_open_menu: "Open menu",
store_header_close_menu: "Close menu",
store_header_back_admin: "Back to Dashboard",
store_header_create_account: "Start selling",
store_header_account_area: "Your account",
store_header_navigation: "Pages",
store_header_new_here: "New here?",
store_header_explore_stores: "Other stores",
store_header_discover_more: "Discover more",

btn_create_product: "Launch Product",

dashboard_store_default_name : "My Store",
dashboard_syncing : "Syncing",

dashboard_welcome_new : "Let’s set up your store in a simple way.",
dashboard_welcome_incomplete : "Your store is started. Complete the missing steps below.",
dashboard_welcome_ready : "Your store is ready. You can manage everything quickly.",

dashboard_stat_products : "Products",
dashboard_stat_pages : "Pages",
dashboard_stat_setup : "Setup",

dashboard_progress_label : "Progress",
dashboard_progress_completed : "completed",

dashboard_setup_label : "Setup",
dashboard_setup_title : "Complete your store",
dashboard_setup_desc : "Follow these simple steps so customers can see and contact your store.",

dashboard_quick_label : "Quick actions",
dashboard_quick_title : "Manage faster",

dashboard_quick_products_title : "Products",
dashboard_quick_products_desc : "Add and manage your catalog.",

dashboard_quick_pages_title : "Pages",
dashboard_quick_pages_desc : "Create and edit your store pages.",

dashboard_quick_settings_title : "Settings",
dashboard_quick_settings_desc : "Set phone number, currency and more.",

dashboard_next_label : "Next step",

dashboard_step_phone_title : "Add phone number",
dashboard_step_phone_desc : "Set your WhatsApp or contact number.",
dashboard_step_phone_action : "Open settings",

dashboard_step_currency_title : "Set currency",
dashboard_step_currency_desc : "Choose the currency for your prices.",
dashboard_step_currency_action : "Set currency",

dashboard_step_product_title : "Create first product",
dashboard_step_product_desc : "Add a product to start your catalog.",
dashboard_step_product_action : "Add product",

dashboard_step_page_title : "Create home page",
dashboard_step_page_desc : "Make the main page for your store.",
dashboard_step_page_action : "Create page",

dashboard_error_title : "Something went wrong",
dashboard_error_desc : "We could not load your dashboard.",
dashboard_error_action : "Reload",
dashboard_products_label : "Products",
dashboard_products_title : "Your products",
dashboard_products_manage : "Manage products",
dashboard_products_empty : "No products yet",

dashboard_pages_label : "Pages",
dashboard_pages_title : "Your pages",
dashboard_pages_manage : "Manage pages",
dashboard_pages_empty : "No pages yet",


dashboard_currency_missing : "No currency",

dashboard_paused_title : "Paused products",
dashboard_page_label : "Page",



dashboard_quick_hint : "Use these anytime to keep building your store.",
dashboard_setup_focus_title : "Complete the next step",
dashboard_setup_focus_desc : "Finish the missing setup items so your store is fully ready.",

delete_product_confirm_title: "Delete product?",
delete_product_confirm_text: "This action cannot be undone. You are about to remove",
btn_cancel: "Cancel",
btn_delete: "Delete",
product_delete_success: "Product deleted successfully",
product_delete_error: "Could not delete the product",
product_status_update_error: "Could not update product status",
products_empty_title: "No products yet",
products_empty_description: "Start by adding your first product so your store can show items to visitors.",
products_empty_step_1_title: "Add product",
products_empty_step_1_text: "Create your first product with image, name and price.",
products_empty_step_2_title: "Organize details",
products_empty_step_2_text: "Use category and status to keep everything clear.",
products_empty_step_3_title: "Set currency",
products_empty_step_3_text: "Choose your store currency so prices stay consistent.",
no_products_found_description: "Try another search term or clear the search to see all products.",
pause_product: "Pause",
activate_product: "Activate",
inventory_description: "Manage your products, prices and visibility in one simple place.",
quick_actions: "Quick actions",
manage_pages: "Manage pages",
currency: "Currency",







products_tutorial_title: "Quick guide",
products_tutorial_description: "Complete the basics so your store stays ready.",
products_tutorial_step_1_title: "Set currency",
products_tutorial_step_2_title: "Add products",
products_tutorial_step_3_title: "Review status",












active_products_title: "Active products",
paused_products_title: "Paused products",
no_active_products: "No active products",
product_activated_success: "Product activated successfully",
product_paused_success: "Product paused successfully",










currency_section_description_saved: "This is the main currency used to show prices in your store.",
currency_section_description_required: "Choose and save the main currency before using product prices.",
currency_current_label: "Current status",
currency_action_label: "Action",
currency_select_label: "Select currency",
currency_edit_hint: "You can change the store currency here if needed.",



currency_section_title: "Store currency",
currency_section_help_text: "Choose the currency used in your product prices.",
currency_suggested_prefix: "Suggested:",
currency_must_save_notice: "Choose and save the currency.",
btn_edit: "Edit",
save_currency: "Save",

currency_section_desc : "If the store does not have a saved currency yet, the system tries to detect and save it automatically only once.",
currency_label : "Currency",
currency_placeholder : "Search by currency code or currency name",
currency_save_success : "Currency saved successfully.",
currency_save_error : "Error saving currency.",
currency_detected_prefix : "Detected:",
currency_source_prefix : "Source:",


currency_required_badge : "Required",
currency_geo_used : "Location used",
currency_required_text : "We used your location to suggest an initial currency. Confirm and save it to display prices correctly.",
currency_saved_badge : "Set",
currency_saved_text : "This currency will be used to display your store prices.",
currency_current_prefix : "Current:",
currency_confirm_label : "Confirm currency",
currency_change_label : "Change currency",
currency_save_hint : "Setting the currency is important to display correct prices to customers.",







contact_title: "Contact us",
contact_subtitle: "Send us a message, view our location, or use the contact details below.",
contact_title_placeholder: "Contact us",
contact_subtitle_placeholder: "Send us a message, view our location, or use the contact details below.",
contact_label_phone: "WhatsApp",
contact_label_email: "Email",
contact_label_location: "Location",
contact_form_title: "Message",
contact_form_card_title: "Send your message",
contact_form_card_desc: "Use the form below to contact us by WhatsApp or email.",
contact_form_name: "Name",
contact_form_message: "Message",
contact_form_name_placeholder: "Your name",
contact_form_message_placeholder: "Write your message...",
contact_send_now: "Send now",
contact_open_maps: "Open map",
contact_route_now: "View route",
contact_close: "Close",
contact_modal_title: "How would you like to send it?",
contact_email_subject: "New contact message",
contact_message_hello: "Hello!",
contact_missing_value: "Not set",
contact_loading_contact: "Loading contact...",
contact_missing_settings_title: "Missing contact details",
contact_missing_settings_desc: "Set the account WhatsApp number and email in settings so visitors can contact you.",
contact_go_settings: "Go to settings",
contact_unavailable_title: "Contact not available yet",
contact_unavailable_desc: "This store has not set a WhatsApp number or email to receive messages yet.",
contact_location_field_placeholder: "Example: Avenida 24 de Julho, Maputo, Mozambique",
contact_location_missing_public: "Location not set yet",
contact_location_format_hint: "Use a clear address. Example: Avenida 24 de Julho, Maputo, Mozambique or CT University, Ludhiana, Punjab, India",
contact_title_limit: "title up to {{count}} characters",
contact_subtitle_limit: "description up to {{count}} characters",
contact_location_limit: "location up to {{count}} characters",
contact_form_name_limit: "name up to {{count}} characters",
contact_form_message_limit: "message up to {{count}} characters",
contact_admin_help_title: "Edit directly in this section",
contact_admin_help_desc: "Click the dashed fields to update the title, description, and location without leaving this area.",
contact_map_hidden_admin: "The map appears only outside the admin panel.",
contact_default_location: "Maputo",












contact_edit_section_title: "Edit directly in this section",
contact_edit_section_desc: "Change title, subtitle and location here. The map only appears on the public page.",
contact_location_area_label: "Location area",
contact_location_placeholder: "Example: ISCTEM Maputo, Zimpeto, CT University",
contact_location_help: "Type a place, university, area or city. We preserve the name and only help Google Maps understand it better.",
contact_location_max: "Max {{count}}",
contact_location_final: "final: {{value}}",
contact_location_smart_help: "smart location help",
contact_location_final_search: "Final search: {{value}}",
contact_location_dropdown_hint: "Suggestion from your saved locations list",
contact_location_final_help: "Showing the final Google Maps search without removing the original name.",
contact_add_location_here: "Add a location here.",












product_form_add_more_images: "Add more images",
product_form_compress_image_link: "Image is too large. Click here to compress it",
product_form_extra_image_label: "Extra image {{number}}",


clickToEditHint: "Select this section to edit exactly here.",
tapToEditHint: "Tap this section and use the card below to customize.",
mobileCustomizeCardHint: "Use the card below to customize this section.",


numberMissing: "Number missing",
addNumberHint: "Add the store number in Settings to activate the button.",
mediaSettings: "Media settings",


store_page_links_discover: "Discover pages",
store_page_links_title: "Navigate to other pages",
store_page_links_subtitle: "Swipe through the available pages and open another section of this store.",
store_page_links_items: "pages",
store_page_links_page: "Page",
store_page_links_home_badge: "home",
store_page_links_navigate_label: "Open page",









media_provider_not_detected: "Link not detected yet",
media_hint_paste: "Paste a link.",
media_error_duplicate: "This link is repeated. Use each link only once.",
media_error_invalid_url: "This link is not valid.",
media_error_wrong_type_media: "This is not a supported media link.",
media_error_unsupported_media: "This media link is not supported yet.",
media_error_wrong_type_social: "This is not a valid social link.",
media_paste_button: "Paste",
media_edit_button: "Edit",
media_done_button: "Done",
media_editor_title: "Manage your media and social links",
media_editor_compact_hint: "Add one link at a time. Valid cards stay compact until you edit them again.",
media_section_media: "Media",
media_section_social: "Social links",
media_group_guide_compact: "Paste a media link and finish it before adding another.",
social_group_guide_compact: "Paste a social link and finish it before adding another.",
media_finish_current_first: "Finish the current item first before adding another.",
media_empty_media: "No media yet",
media_empty_media_hint: "Add a media link to show video or music here.",
media_empty_social: "No social links yet",
media_empty_social_hint: "Add a social link to help visitors find your pages.",
media_add_media: "Add media",
media_add_social: "Add social link",
media_placeholder_media_link: "Paste media link",
media_placeholder_social_link: "Paste social link",
media_provider_youtube: "YouTube",
media_provider_spotify: "Spotify",
media_provider_apple_music: "Apple Music",
media_provider_facebook: "Facebook",
media_provider_instagram: "Instagram",
media_provider_tiktok: "TikTok",
media_provider_x: "X",
media_provider_linkedin: "LinkedIn",
media_provider_website: "Website",
media_open_link: "Open",
media_status_valid: "Valid",
media_status_invalid: "Invalid",
media_summary_valid_total: "valid links",
media_toast_item_valid: "Valid link added successfully.",



media_provider_video: "Video",
media_provider_image: "Image",
media_tap_to_open: "Tap to open",

media_provider_youtube_music: "YouTube Music",
media_clear_button: "Clear link",


  },











































  pt: {
    // Navegação & UI
    nav_home: "Explorar",
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
    
    changeMedia: "Trocar Foto",
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



section_texto_imagem_showcase: "Mosaico com Texto",
section_texto_narrativo: "Bloco de Texto",

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



















  aboutBadge: "Sobre",
aboutTitle: "Minha Abordagem: Paixão e Precisão",
aboutSubtitle: "Uma visão clara, moderna e focada em resultados.",
aboutDescription: "Minha jornada no mundo digital começou com curiosidade e vontade de construir soluções úteis. Hoje, uno criatividade, método e atenção aos detalhes para entregar experiências modernas, claras e eficientes.",
aboutSecondaryTitle: "Quem Eu Sou",
aboutSecondaryDescription: "Sou um profissional focado em criar soluções digitais bem estruturadas, responsivas e pensadas para crescer com qualidade.",

textSectionSimpleHelp: "Edite os textos. Os limites já ajudam a manter o layout bonito.",
imageSectionSimpleHelp: "Edite os textos e escolha uma foto. Depois clique em confirmar.",
fillBadge: "Escreva um selo curto",
fillMainTitle: "Escreva o título",
fillSubtitle: "Escreva o subtítulo",
fillDescription: "Escreva a descrição",
fillSecondaryTitle: "Escreva o título secundário",
fillSecondaryDescription: "Escreva o texto secundário",
defaultImageAlt: "Imagem da secção",

uploadPhoto: "Carregar foto",
confirmPhoto: "Confirmar foto",
savingPhoto: "A guardar...",
removePhoto: "Remover foto",














  processing: 'A processar...',
  adjustPhoto: 'Ajuste a foto',
  cropApplied: 'Recorte aplicado com sucesso.',
  imageSavedSuccess: 'Imagem enviada com sucesso.',
  imageUploadError: 'Falha ao enviar a imagem.',
  imageRemoved: 'Imagem removida com sucesso.',
  imageRemoveError: 'Falha ao remover a imagem.',
  uploadSuccess: 'Upload concluído com sucesso.',
  uploadError: 'Falha ao enviar o ficheiro.',
  fileReadError: 'Erro ao ler o arquivo. Tente novamente.',
  imageTypeError: 'Selecione uma imagem válida.',
  imageTooLargeMustCompress: 'A imagem está acima do limite. Comprima antes de enviar.',
  compressPhotoLink: 'Comprimir imagem',
  choosePhoto: 'Escolher foto',
  changePhoto: 'Trocar foto',
  
  movePhoto: 'Mova a foto',
  imageWeight: 'Peso',
  imageSizeLimit: 'Tamanho máximo: {{size}} MB',
  defaultImage: 'Imagem padrão',
  
  editor_modal_sync_required: 'Sincronização necessária',





  imageTooLargeCropBlocked: 'Não é possível aplicar o recorte numa imagem acima do limite.',
saveBlockedPendingSection: 'Ação bloqueada: a secção {{section}} possui uploads pendentes ou muito grandes.',
savingPage: 'Salvando página...',
publishedSuccess: 'Publicado com sucesso!',
publishError: 'Erro ao publicar.',







  cropError: "Erro ao aplicar o recorte",
  applyCrop: "Aplicar recorte",
  sectionsNeedSaving:"Secções pendentes de salvar",
  

  imageReadyConfirmHelp:"A imagem já foi escolhida. Agora clique em confirmar imagem para salvar.",
  imageSelectedConfirmToSave:"Imagem selecionada. Confirme para salvar.",
imageSelectionCancelled: "Seleção de imagem cancelada",


clickToEdit: "Clique para editar",
  tapToEdit: "Toque para editar",
  editingSection: "Editando",
  loadingEditor: "A carregar editor...",
  waitingAddressesLoad: "Aguardando carregamento dos endereços...",


  cacheLabel: "cache",
  cacheStatusLocal: "local",
  cacheStatusNetwork: "network",
  cacheStatusWaiting: "aguardando",
  cacheStatusSyncing: "sincronizando",
  invalid_store_name: "Nome da loja inválido",
  blockDefaultName: "BLOCO",









  marketplace_product_fallback: "Produto",
  marketplace_general: "Geral",
  marketplace_store_fallback: "Loja",
  marketplace_store_default_description: "Descobre produtos e novidades desta loja.",
  marketplace_all_categories: "Todas as categorias",
  marketplace_all_stores: "Todas as lojas",
  marketplace_new_products: "Novos produtos",
  marketplace_more_new_products: "Mais novos produtos",
  marketplace_available_stores: "Lojas disponíveis",
  marketplace_more_stores: "Mais lojas para explorar",
  marketplace_start_selling_title: "Começa a vender na Storely",
  marketplace_start_selling_subtitle: "Cria a tua conta e começa a publicar produtos num marketplace rápido, moderno e profissional.",
  marketplace_start_selling_cta: "Criar conta",
  marketplace_search_placeholder: "Pesquisar no marketplace",
  marketplace_suggestions: "Sugestões",
  marketplace_recent_searches: "Pesquisas recentes",
  marketplace_explore: "Explorar",
  marketplace_sell_now: "Vender agora",
  marketplace_clear_filters: "Limpar filtros",
  marketplace_view_store: "Ver loja",
  marketplace_main_feed: "Feed principal",
  marketplace_hero_title_line_1: "Descobre produtos,",
  marketplace_hero_title_line_2: "lojas e sugestões inteligentes",
  marketplace_hero_explore: "Explorar marketplace",
  marketplace_hero_sell: "Quero vender",
  marketplace_hero_smart_block: "Pesquisa e recomendações inteligentes",
  marketplace_showcase_title: "Marketplace da comunidade",
  marketplace_showcase_subtitle: "Produtos, lojas e sugestões.",






  
  marketplace_search_exact: "Resultado exato",
  marketplace_search_approximate: "Resultado aproximado",
  marketplace_search_related: "Resultados relacionados",
  marketplace_search_fallback: "Sugestões do marketplace",
  marketplace_cache: "cache",
  marketplace_cache_expired: "expirado",
  marketplace_syncing: "a sincronizar",
  marketplace_refresh_cache: "atualizar cache",
  marketplace_not_found_title: "Nada muito próximo foi encontrado",
  marketplace_not_found_subtitle: "Tenta outro nome, categoria ou loja. Também podes escolher uma das sugestões abaixo.",
  marketplace_try_these: "Experimenta isto",


 
marketplace_related_products: "Produtos relacionados",
marketplace_related_stores: "Lojas relacionadas",
marketplace_search_products: "Produtos encontrados",
marketplace_search_stores: "Lojas encontradas",






storely_product_fallback: "Produto",
storely_general: "Geral",
storely_store_fallback: "Loja",
storely_store_default_description: "Descobre produtos e novidades desta loja.",
storely_all_categories: "Todas as categorias",
storely_all_stores: "Todas as lojas",
storely_new_products: "Novidades na Storely",
storely_more_new_products: "Mais novidades",
storely_available_stores: "Lojas na Storely",
storely_more_stores: "Mais lojas para explorar",
storely_related_products: "Produtos relacionados",
storely_related_stores: "Lojas relacionadas",
storely_matching_stores: "Lojas encontradas",
storely_similar_stores: "Lojas parecidas",
storely_more_like_this: "Mais como isto",
storely_exact_matches: "Resultados exatos",
storely_close_matches: "Resultados parecidos",
storely_suggestions_for_you: "Sugestões para ti",
storely_start_selling_title: "Começa a vender na Storely",
storely_start_selling_subtitle: "Cria a tua conta e publica produtos de forma rápida, bonita e inteligente.",
storely_start_selling_cta: "Criar conta",
storely_search_placeholder: "Pesquisar na Storely",
storely_suggestions: "Sugestões",
storely_recent_searches: "Pesquisas recentes",
storely_explore: "Explorar",
storely_sell_now: "Vender agora",
storely_clear_filters: "Limpar filtros",
storely_view_store: "Ver loja",
storely_main_feed: "Feed principal",
storely_search_exact: "Resultado exato",
storely_search_approximate: "Resultado aproximado",
storely_search_related: "Resultados relacionados",
storely_search_fallback: "Sugestões da Storely",
storely_cache: "cache",
storely_cache_expired: "expirado",
storely_syncing: "a sincronizar",
storely_refresh_cache: "atualizar",
storely_not_found_title: "Nada muito próximo foi encontrado",
storely_not_found_subtitle: "Tenta outro nome, categoria ou loja. Também podes escolher uma das sugestões abaixo.",
storely_try_these: "Experimenta isto",









storely_search_no_exact_but_close: "Sem resultado exato, mas há resultados parecidos",
storely_search_no_exact_but_related: "Sem resultado exato, mas há resultados relacionados",
storely_search_nothing_close: "Nada muito próximo, mas há sugestões para ti",
storely_search_message_close: "Não encontrei um nome exatamente igual, mas aqui estão os resultados mais parecidos que podem te ajudar.",
storely_search_message_related: "Não encontrei um resultado exato, mas selecionei coisas relacionadas que possas gostar.",



storely_search_empty_title: "Nenhum resultado encontrado",
storely_search_empty_subtitle: "Não encontramos nada que corresponda à sua pesquisa. Tente outra palavra ou explore outros produtos abaixo.",
storely_search_message_fallback: "Não encontramos nada semelhante, mas aqui estão algumas sugestões que podem interessar.",
storely_other_products_we_have: "Outros produtos que temos",

marketplace_hero_badge: "Descubra mais num só lugar",
marketplace_hero_subtitle: "Explore um marketplace com vários tipos de produtos e lojas numa experiência simples, rápida e organizada.",
marketplace_hero_point_products: "Vários tipos de produtos",
marketplace_hero_point_stores: "Múltiplas lojas",
marketplace_hero_point_discover: "Fácil de explorar",
storely_cta_title: "Comece a vender os seus produtos hoje",
storely_cta_subtitle: "Crie a sua loja, mostre os seus produtos e alcance mais clientes numa plataforma simples.",




































product_form_create_title: "Criar produto",
product_form_edit_title: "Editar produto",
product_form_intro: "Preencha o essencial sem se perder. Primeiro imagens, depois preço, categoria e descrição.",
product_form_cover: "CAPA",
product_form_add_cover: "Adicionar capa",
product_form_add_image: "Adicionar imagem",
product_form_image_help: "Use até 4 imagens. A primeira é a capa. Cada imagem deve ter no máximo 1MB.",
product_form_image_too_large: "Imagem muito grande. Use até 1MB.",
product_form_name_label: "Nome",
product_form_name_placeholder: "O que estás a vender?",
product_form_price_label: "Preço",
product_form_price_whole: "Valor",
product_form_price_cents: "Centavos",
product_form_price_help: "O valor fica separado dos centavos para evitar confusão. Exemplo: 4 e 00 vira 4.00.",
product_form_category_label: "Categoria",
product_form_category_placeholder: "Ex: Mobília",
product_form_unit_label: "Unidade de medida",
product_form_unit_un: "Unidade",
product_form_unit_par: "Par",
product_form_unit_kit: "Kit",
product_form_unit_pacote: "Pacote",
product_form_unit_caixa: "Caixa",
product_form_unit_kg: "Quilograma",
product_form_unit_g: "Grama",
product_form_unit_l: "Litro",
product_form_unit_ml: "Mililitro",
product_form_unit_m: "Metro",
product_form_unit_cm: "Centímetro",
product_form_unit_m2: "Metro quadrado",
product_form_unit_m3: "Metro cúbico",
product_form_unit_hora: "Hora",
product_form_unit_dia: "Dia",
product_form_unit_semana: "Semana",
product_form_unit_mes: "Mês",
product_form_unit_servico: "Serviço",
product_form_description_label: "Descrição",
product_form_description_placeholder: "Explique o produto de forma simples, clara e útil.",
product_form_description_help: "Foque no que ajuda o cliente a decidir: tamanho, material, cor, uso ou estado.",
product_form_pending_title: "Falta concluir",
product_form_ready_title: "Pronto para guardar",
product_form_ready_subtitle: "Os dados principais estão preenchidos corretamente.",
product_form_pending_name: "Nome",
product_form_pending_category: "Categoria",
product_form_pending_price: "Preço",
product_form_pending_cover: "Capa",
product_form_pending_images: "Imagens",
product_form_create_action: "Publicar",
product_form_save_action: "Guardar",
product_form_created_success: "Produto criado com sucesso.",
product_form_updated_success: "Produto atualizado com sucesso.",
product_form_save_error: "Não foi possível guardar o produto.",
product_form_store_not_found: "Loja do administrador não encontrada.",
product_form_product_not_found: "Produto não encontrado.",
product_form_error_name_required: "Adicione um nome para o produto.",
product_form_error_name_short: "O nome ainda está muito curto.",
product_form_error_category_required: "Escolha ou escreva uma categoria.",
product_form_error_price_required: "Defina o preço do produto.",
product_form_error_price_invalid: "O preço deve ser maior que zero.",
product_form_error_cover_required: "Adicione uma imagem de capa.",
product_form_error_images_invalid: "Há imagens com problema de tamanho.",
product_form_image_delete_error: "Não foi possível apagar a imagem temporária.",


storely_all: "Todos",
storely_clear: "Limpar",
storely_search: "Pesquisar",









store_currency_section_title: "Moeda da loja",
store_currency_section_desc: "Na primeira vez, detectamos automaticamente a moeda mais provável com base no dispositivo e salvamos se a loja ainda não tiver uma moeda definida.",
store_currency_detected_label: "Detectado",
store_currency_save_success: "Moeda salva com sucesso.",
store_currency_save_error: "Erro ao salvar a moeda.",
store_products_empty: "Nenhum produto encontrado.",



currency_section_title : "Moeda da loja",
currency_section_desc : "Se a loja ainda não tiver moeda guardada, o sistema tenta detectar e guardar automaticamente apenas uma vez.",
currency_label : "Moeda",
currency_placeholder : "Pesquisar por código ou nome da moeda",
currency_save_success : "Moeda guardada com sucesso.",
currency_save_error : "Erro ao guardar a moeda.",
save_currency : "Guardar",
currency_detected_prefix : "Detectada:",
currency_source_prefix : "Fonte:",

currency_required_badge : "Obrigatório",
currency_geo_used : "Localização usada",
currency_required_text : "Usamos a sua localização para sugerir uma moeda inicial. Confirme e guarde para mostrar os preços corretamente.",
currency_saved_badge : "Definida",
currency_saved_text : "Esta moeda será usada para mostrar os preços da sua loja.",
currency_current_prefix : "Atual:",
currency_suggested_prefix : "Sugestão:",
currency_confirm_label : "Confirmar moeda",
currency_change_label : "Alterar moeda",
currency_save_hint : "Definir a moeda é importante para mostrar preços corretos aos clientes.",


product_form_image_removed_cloud: "Imagem apagada da nuvem e do formulário.",
product_form_image_removed_local: "Imagem removida do formulário.",
product_form_image_removed_local_only_after_cloud_fail: "Imagem removida só do formulário. A remoção na nuvem falhou.",








product_form_image_replaced_cloud: "Imagem anterior apagada da nuvem e substituída no formulário.",
product_form_image_replaced_local: "Imagem substituída no formulário.",
product_form_image_replaced_local_only_after_cloud_fail: "Imagem substituída no formulário, mas não foi possível apagar a anterior da nuvem.",
product_form_image_replace_error: "Não foi possível substituir a imagem.",

clearCache : "Limpar cache",
cacheClearedSuccess : "Cache limpo com sucesso.",
cacheClearedError : "Erro ao limpar o cache.",
cache_refresh_success : "Cache atualizado com sucesso.",
cache_refresh_error : "Erro ao atualizar o cache.",




new_product: "Novo produto",
product_details_share_text: "Veja este produto:",
product_details_whatsapp_unavailable: "O número de WhatsApp da loja não está disponível.",
product_details_order_message_intro: "Olá, quero encomendar este produto:",
product_details_quantity: "Quantidade",
product_details_total: "Total",




storely_categories: "Categorias",

storely_products: "produtos",
storely_stores: "lojas",

storely_sell_cta_title: "Comece a vender com a sua própria loja",
storely_sell_cta_subtitle: "Crie a sua loja, mostre os seus produtos e alcance mais pessoas de forma bonita.",
storely_no_results_title: "Nenhum resultado encontrado",
storely_no_results_subtitle: "Tente outro nome, categoria ou loja para descobrir mais produtos.",

storely_found_products: "Productos Encontrados",








    
    product_details_order_message_buyer_hint: "Gostaria de mais detalhes e disponibilidade atual.",
    product_details_order_message_product: "Produto",
    product_details_order_message_unit_price: "Preço unitário",
    product_details_order_message_quantity: "Quantidade",
    product_details_order_message_total: "Total",
    product_details_order_message_store: "Loja",
    product_details_order_message_closing: "Pode confirmar se ainda está disponível?",
    product_details_cta_badge: "Compra rápida",
    product_details_cta_title: "Gostou deste produto?",
    product_details_cta_subtitle: "Fale com a loja agora e confirme disponibilidade, preço e entrega em segundos.",
    product_details_price_label: "Preço por unidade",
    product_details_quantity_label: "Escolha a quantidade",
    product_details_gallery_open: "Abrir imagem",
    product_details_image_counter: "{{current}} de {{total}}",
    product_details_about_product: "Sobre este produto",
    product_form_unit_:"Formato da unidade do produto",







    auth_brand: "Storely",
    auth_support: "Suporte",
    auth_callback_success: "Autenticação concluída com sucesso.",
    auth_callback_error: "Não foi possível concluir a autenticação.",
    auth_callback_title: "A concluir autenticação",
    auth_callback_desc: "Aguarde enquanto regressamos em segurança à Storely.",
    auth_enter_email_first: "Digite primeiro o seu email.",
    auth_reset_email_sent: "Email de redefinição de palavra-passe enviado.",
    auth_reset_email_error: "Falha ao enviar o email de redefinição.",
    auth_store_required: "Por favor, digite o nome da sua loja.",
    auth_store_invalid: "Por favor, digite um nome de loja válido.",
    auth_slug_min_chars: "Use pelo menos 3 caracteres.",
    auth_slug_invalid_chars: "Use apenas letras minúsculas, números e hífens.",
    auth_slug_reserved: "Este nome de loja não está disponível.",
    auth_slug_checking: "A verificar nome da loja...",
    auth_slug_taken: "Este nome de loja já existe.",
    auth_slug_available: "O nome da loja está disponível.",
    auth_slug_wait: "Aguarde enquanto verificamos o nome da loja.",
    auth_user_missing: "A conta foi criada, mas os dados do utilizador não foram encontrados.",
    auth_signup_success: "Conta criada com sucesso.",
    auth_login_success: "Bem-vindo de volta.",
    auth_generic_error: "Algo correu mal. Tente novamente.",
    auth_desktop_big_title_line1: "CRIE A SUA",
    auth_desktop_big_title_line2: "LOJA",
    auth_desktop_big_title_line3: "DIGITAL",
    auth_desktop_subtitle_compact: "De forma simples, rápida e gratuita. Comece a vender hoje com a melhor plataforma para empreendedores.",
    auth_desktop_point_1: "Configuração Instantânea",
    auth_desktop_point_2: "Painel Administrativo Intuitivo",
    auth_desktop_point_3: "Suporte Especializado",
    auth_mobile_title_line1: "Crie a sua",
    auth_mobile_title_line2: "loja digital",
    auth_mobile_subtitle_professional: "Comece a vender com uma experiência de acesso profissional pensada para celular e computador.",
    auth_create_account: "Criar conta",
    auth_login: "Entrar",
    auth_start_here: "Comece aqui",
    auth_welcome_back_small: "Bem-vindo de volta",
    auth_heading_signup: "Crie a sua conta",
    auth_heading_login: "Entre na Storely",
    auth_signup_description_professional: "Digite o seu email, palavra-passe e nome da loja para começar a sua loja de forma profissional.",
    auth_login_description_professional: "Use o seu email e palavra-passe para continuar em segurança para o seu painel.",
    auth_error_title: "Algo correu mal",
    auth_email_label: "Email",
    auth_email_placeholder: "nome@email.com",
    auth_store_name_label: "Nome da loja",
    auth_store_name_placeholder: "Ex: Minha Boutique Premium",
    auth_store_url_preview: "URL",
    auth_password_label: "Palavra-passe",
    auth_forgot_password: "Esqueceu a palavra-passe?",
    auth_forgot_title: "Recupere o seu acesso",
    auth_forgot_description: "Digite o seu email e enviaremos um link seguro para criar uma nova palavra-passe.",
    auth_send_reset_link: "Enviar link de redefinição",
    auth_recovery_label: "Recuperação",
    auth_or: "ou",
    auth_switch_login_title: "Já tem conta?",
    auth_switch_signup_title: "Precisa de uma nova conta de loja?",
    auth_go_to_login: "Ir para entrar",
    auth_go_to_signup: "Criar conta primeiro",
    auth_account_found_title: "Conta encontrada",
    auth_existing_email_go_login: "Este email já está registado. Por favor, continue através do login.",
    auth_existing_store_go_login: "Este nome de loja já está em uso. Se for sua, por favor, continue através do login.",
    auth_remembered_password: "Lembrou-se da palavra-passe?",
    auth_back_to_login: "Voltar ao login",
    auth_reset_invalid_link: "Link de recuperação inválido ou expirado.",
    auth_reset_fill_both: "Preencha os dois campos da palavra-passe.",
    auth_reset_password_mismatch: "As palavras-passe não coincidem.",
    auth_reset_password_short: "A palavra-passe deve ter pelo menos 6 caracteres.",
    auth_reset_success: "Palavra-passe atualizada com sucesso.",
    auth_reset_save_error: "Não foi possível atualizar a palavra-passe.",
    auth_reset_label: "Recuperação",
    auth_reset_title: "Redefinir palavra-passe",
    auth_reset_description: "Crie uma nova palavra-passe para a sua conta Storely.",
    auth_reset_new_password: "Nova palavra-passe",
    auth_reset_confirm_password: "Confirmar palavra-passe",
    auth_reset_save_password: "Guardar nova palavra-passe",

    auth_callback_loading_message: "Validando as suas credenciais...",
    auth_callback_loading_title: "A verificar acesso",
    auth_callback_success_title: "Verificado",
    auth_callback_error_title: "Erro de acesso",
    auth_callback_redirecting: "A redirecionar...",
    auth_callback_back_login: "Voltar ao login",
    auth_callback_link_error: "Este link expirou ou já foi utilizado.",
    auth_callback_recovery_success: "Identidade confirmada. Vamos criar a sua nova palavra-passe.",
    auth_callback_email_change_success: "Email verificado com sucesso. A sua conta foi atualizada.",
    auth_callback_login_success: "Autenticação concluída com sucesso.",
    auth_callback_no_session: "Não foi possível validar a sua sessão. Tente novamente.",
    auth_callback_generic_error: "Não foi possível concluir a autenticação.",


    auth_password_min_length: "A palavra-passe deve ter pelo menos 6 caracteres.",
    auth_password_hint_min: "Mínimo de 6 caracteres.",
    auth_show_password: "Mostrar palavra-passe",
    auth_hide_password: "Ocultar palavra-passe",


    auth_signup_description_short: "Use o seu email, palavra-passe e nome da loja para começar.",
    auth_login_description_short: "Entre em segurança para continuar para o seu painel.",
    auth_side_title_1: "Verificação inteligente do nome da loja",
    auth_side_text_1: "A verificação do nome da loja usa debounce e cache para reduzir leituras desnecessárias e manter o uso da API eficiente.",
    auth_side_title_2: "Recuperação segura",
    auth_side_text_2: "A recuperação de palavra-passe leva o utilizador diretamente de volta à Storely para criar uma nova palavra-passe com segurança.",

        auth_store_name_length_invalid: "O nome da loja deve ter entre 2 e 40 caracteres.",





        security_recovery_title: "Redefinir Palavra-passe",
security_recovery_subtitle: "Crie uma nova palavra-passe segura para a sua conta.",
security_recovery_mode_active: "Modo de Recuperação Ativo",
security_current_password: "Palavra-passe Atual",
security_new_password: "Nova Palavra-passe",
security_confirm_password: "Repetir Palavra-passe",
security_password_min_error: "A palavra-passe deve ter pelo menos 6 caracteres.",
security_password_min_hint: "Mínimo de 6 caracteres.",
security_passwords_not_match: "As palavras-passe não coincidem.",
security_current_password_required: "Digite a sua palavra-passe atual.",
security_current_password_incorrect: "A palavra-passe atual está incorreta.",
security_email_missing: "Nenhum email encontrado para esta conta.",
security_reset_success: "Palavra-passe redefinida com sucesso!",
security_reset_email_sent: "Email de redefinição enviado com sucesso!",
security_reset_email_error: "Falha ao enviar o email de redefinição.",
security_sending_email: "A enviar...",
security_forgot_password: "Esqueci a minha palavra-passe",
security_save_new_password: "Guardar Nova Palavra-passe",











store_header_page_fallback: "Página",
store_header_store_fallback: "Loja",
store_header_menu: "Menu",
store_header_open_menu: "Abrir menu",
store_header_close_menu: "Fechar menu",
store_header_back_admin: "Voltar ao Dashboard",
store_header_create_account: "Começa a vender",
store_header_account_area: "Sua conta",
store_header_navigation: "Páginas",
store_header_new_here: "Novo por aqui?",
store_header_explore_stores: "Mais lojas",
store_header_discover_more: "Descobrir mais",
btn_create_product: "Lançar Produto",



dashboard_store_default_name : "Minha Loja",
dashboard_syncing : "A atualizar",

dashboard_welcome_new : "Vamos configurar a sua loja de forma simples.",
dashboard_welcome_incomplete : "A sua loja já começou. Complete os passos em falta abaixo.",
dashboard_welcome_ready : "A sua loja está pronta. Já pode gerir tudo rapidamente.",

dashboard_stat_products : "Produtos",
dashboard_stat_pages : "Páginas",
dashboard_stat_setup : "Configuração",

dashboard_progress_label : "Progresso",
dashboard_progress_completed : "concluído",

dashboard_setup_label : "Configuração",
dashboard_setup_title : "Complete a sua loja",
dashboard_setup_desc : "Siga estes passos simples para que os clientes possam ver e contactar a sua loja.",

dashboard_quick_label : "Ações rápidas",
dashboard_quick_title : "Gerir mais rápido",

dashboard_quick_products_title : "Produtos",
dashboard_quick_products_desc : "Adicione e gerencie o seu catálogo.",

dashboard_quick_pages_title : "Páginas",
dashboard_quick_pages_desc : "Crie e edite as páginas da sua loja.",

dashboard_quick_settings_title : "Configurações",
dashboard_quick_settings_desc : "Defina número, moeda e mais.",

dashboard_next_label : "Próximo passo",

dashboard_step_phone_title : "Adicionar número",
dashboard_step_phone_desc : "Defina o seu WhatsApp ou número de contacto.",
dashboard_step_phone_action : "Abrir configurações",

dashboard_step_currency_title : "Definir moeda",
dashboard_step_currency_desc : "Escolha a moeda dos seus preços.",
dashboard_step_currency_action : "Definir moeda",

dashboard_step_product_title : "Criar primeiro produto",
dashboard_step_product_desc : "Adicione um produto para começar o catálogo.",
dashboard_step_product_action : "Adicionar produto",

dashboard_step_page_title : "Criar página inicial",
dashboard_step_page_desc : "Crie a página principal da sua loja.",
dashboard_step_page_action : "Criar página",

dashboard_error_title : "Algo correu mal",
dashboard_error_desc : "Não foi possível carregar o dashboard.",
dashboard_error_action : "Recarregar",

dashboard_products_label : "Produtos",
dashboard_products_title : "Seus produtos",
dashboard_products_manage : "Gerir produtos",
dashboard_products_empty : "Ainda não há produtos",

dashboard_pages_label : "Páginas",
dashboard_pages_title : "Suas páginas",
dashboard_pages_manage : "Gerir páginas",
dashboard_pages_empty : "Ainda não há páginas",

dashboard_currency_missing : "Sem moeda",

dashboard_paused_title : "Produtos pausados",
dashboard_page_label : "Página",

dashboard_quick_hint : "Use estas ações a qualquer momento para continuar a construir a sua loja.",
dashboard_setup_focus_title : "Complete o próximo passo",
dashboard_setup_focus_desc : "Finalize os itens em falta para que a sua loja fique totalmente pronta.",

inventory_description: "Gerencie os seus produtos de forma simples e organizada.",


currency: "Moeda",


btn_cancel: "Cancelar",
btn_delete: "Eliminar",



pause_product: "Pausar",
activate_product: "Ativar",



delete_product_confirm_title: "Eliminar produto?",
delete_product_confirm_text: "Esta ação não pode ser desfeita. Está prestes a remover",
product_delete_success: "Produto eliminado com sucesso",
product_delete_error: "Não foi possível eliminar o produto",
product_status_update_error: "Não foi possível atualizar o estado do produto",

products_empty_title: "Ainda não existem produtos",
products_empty_description: "Comece por adicionar o seu primeiro produto para o mostrar na sua loja.",

no_products_found_description: "Tente outro termo de pesquisa ou limpe a pesquisa.",

products_tutorial_title: "Guia rápido",
products_tutorial_description: "Complete o básico para manter a sua loja pronta.",
products_tutorial_step_1_title: "Definir moeda",
products_tutorial_step_2_title: "Adicionar produtos",
products_tutorial_step_3_title: "Rever estado",



active_products_title: "Produtos ativos",
paused_products_title: "Produtos em pausa",
no_active_products: "Não existem produtos ativos",
product_activated_success: "Produto ativado com sucesso",
product_paused_success: "Produto pausado com sucesso",



currency_section_description_saved: "Esta é a moeda principal usada para mostrar os preços na sua loja.",
currency_section_description_required: "Escolha e guarde a moeda principal antes de usar preços nos produtos.",
currency_current_label: "Estado atual",
currency_action_label: "Ação",
currency_select_label: "Selecionar moeda",
currency_edit_hint: "Pode alterar aqui a moeda da loja, se for necessário.",








currency_section_help_text: "Escolha a moeda usada nos preços dos seus produtos.",
currency_must_save_notice: "Escolha e guarde a moeda.",















contact_title: "Fale connosco",
contact_subtitle: "Envie uma mensagem, veja a nossa localização ou use os contactos abaixo.",
contact_title_placeholder: "Fale connosco",
contact_subtitle_placeholder: "Envie uma mensagem, veja a nossa localização ou use os contactos abaixo.",
contact_label_phone: "WhatsApp",
contact_label_email: "E-mail",
contact_label_location: "Localização",
contact_form_title: "Mensagem",
contact_form_card_title: "Envie a sua mensagem",
contact_form_card_desc: "Use o formulário abaixo para falar connosco por WhatsApp ou e-mail.",
contact_form_name: "Nome",
contact_form_message: "Mensagem",
contact_form_name_placeholder: "O seu nome",
contact_form_message_placeholder: "Escreva a sua mensagem...",
contact_send_now: "Enviar agora",
contact_open_maps: "Abrir mapa",
contact_route_now: "Ver rota",
contact_close: "Fechar",
contact_modal_title: "Como deseja enviar?",
contact_email_subject: "Nova mensagem de contacto",
contact_message_hello: "Olá!",
contact_missing_value: "Não definido",
contact_loading_contact: "A carregar contacto...",
contact_missing_settings_title: "Dados de contacto em falta",
contact_missing_settings_desc: "Defina o WhatsApp e o e-mail da conta nas configurações para os visitantes poderem entrar em contacto.",
contact_go_settings: "Ir para configurações",
contact_unavailable_title: "Contacto ainda não disponível",
contact_unavailable_desc: "Esta loja ainda não definiu WhatsApp ou e-mail para receber mensagens.",
contact_location_field_placeholder: "Ex.: Avenida 24 de Julho, Maputo, Mozambique",
contact_location_missing_public: "Localização ainda não definida",
contact_location_format_hint: "Use um endereço claro. Ex.: Avenida 24 de Julho, Maputo, Mozambique ou CT University, Ludhiana, Punjab, India",
contact_title_limit: "título até {{count}} caracteres",
contact_subtitle_limit: "descrição até {{count}} caracteres",
contact_location_limit: "localização até {{count}} caracteres",
contact_form_name_limit: "nome até {{count}} caracteres",
contact_form_message_limit: "mensagem até {{count}} caracteres",
contact_admin_help_title: "Edite diretamente nesta secção",
contact_admin_help_desc: "Clique nos campos com borda tracejada para atualizar título, descrição e localização sem sair desta área.",
contact_map_hidden_admin: "O mapa aparece apenas fora do painel de administração.",
contact_default_location: "Maputo",











contact_edit_section_title: "Edite diretamente nesta secção",
contact_edit_section_desc: "Altere o título, subtítulo e localização aqui. O mapa só aparece na página pública.",
contact_location_area_label: "Área da localização",
contact_location_placeholder: "Exemplo: ISCTEM Maputo, Zimpeto, CT University",
contact_location_help: "Escreva um lugar, universidade, área ou cidade. Mantemos o nome e só ajudamos o Google Maps a entender melhor.",
contact_location_max: "Máx. {{count}}",
contact_location_final: "final: {{value}}",
contact_location_smart_help: "ajuda inteligente de localização",
contact_location_final_search: "Pesquisa final: {{value}}",
contact_location_dropdown_hint: "Sugestão da sua lista de localizações",
contact_location_final_help: "A mostrar a pesquisa final do Google Maps sem remover o nome original.",
contact_add_location_here: "Adicione uma localização aqui.",








product_form_add_more_images: "Adicionar mais imagens",
product_form_compress_image_link: "Imagem muito grande. Clique aqui para comprimir",
product_form_extra_image_label: "Imagem extra {{number}}",



clickToEditHint: "Selecione esta secção para editar exatamente aqui.",
tapToEditHint: "Toque nesta secção e use o card abaixo para personalizar.",
mobileCustomizeCardHint: "Use o card abaixo para personalizar esta secção.",
numberMissing: "Número em falta",
addNumberHint: "Adicione o número da loja nas Definições para ativar o botão.",
mediaSettings: "Definições da mídia",





store_page_links_discover: "Descobrir páginas",
store_page_links_title: "Navegue para outras páginas",
store_page_links_subtitle: "Deslize pelas páginas disponíveis e abra outra secção desta loja.",
store_page_links_items: "páginas",
store_page_links_page: "Página",
store_page_links_home_badge: "início",
store_page_links_navigate_label: "Abrir página",
















media_provider_not_detected: "Link ainda não detectado",
media_hint_paste: "Cole um link.",
media_error_duplicate: "Este link está repetido. Use cada link apenas uma vez.",
media_error_invalid_url: "Este link não é válido.",
media_error_wrong_type_media: "Este não é um link de mídia suportado.",
media_error_unsupported_media: "Este link de mídia ainda não é suportado.",
media_error_wrong_type_social: "Este não é um link social válido.",
media_paste_button: "Colar",
media_edit_button: "Editar",
media_done_button: "Feito",
media_editor_title: "Gerir os seus links de mídia e redes sociais",
media_editor_compact_hint: "Adicione um link de cada vez. Cards válidos ficam compactos até editar novamente.",
media_section_media: "Mídia",
media_section_social: "Redes sociais",
media_group_guide_compact: "Cole um link de mídia e termine-o antes de adicionar outro.",
social_group_guide_compact: "Cole um link social e termine-o antes de adicionar outro.",
media_finish_current_first: "Complete primeiro o item atual antes de adicionar outro.",
media_empty_media: "Ainda não há mídia",
media_empty_media_hint: "Adicione um link de mídia para mostrar vídeo ou música aqui.",
media_empty_social: "Ainda não há links sociais",
media_empty_social_hint: "Adicione um link social para ajudar os visitantes a encontrar as suas páginas.",
media_add_media: "Adicionar mídia",
media_add_social: "Adicionar link social",
media_placeholder_media_link: "Cole o link de mídia",
media_placeholder_social_link: "Cole o link social",
media_provider_youtube: "YouTube",
media_provider_spotify: "Spotify",
media_provider_apple_music: "Apple Music",
media_provider_facebook: "Facebook",
media_provider_instagram: "Instagram",
media_provider_tiktok: "TikTok",
media_provider_x: "X",
media_provider_linkedin: "LinkedIn",
media_provider_website: "Website",
media_open_link: "Abrir",
media_status_valid: "Válido",
media_status_invalid: "Inválido",
media_summary_valid_total: "links válidos",
media_toast_item_valid: "Link válido adicionado com sucesso.",



media_provider_video: "Vídeo",
media_provider_image: "Imagem",
media_tap_to_open: "Toque para abrir",

media_provider_youtube_music: "YouTube Music",
media_clear_button: "Limpar link",
}












} as const;

export type Language = 'en' | 'pt';
export type TranslationKeys = keyof typeof translations['en'];