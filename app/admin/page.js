<style>
    #header-outer.scrolled {
        background-color: var(--navy);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.2);
    }
    
    html[data-theme='light'] #header-outer.scrolled {
        background-color: var(--header-scrolled-bg);
        backdrop-filter: blur(8px);
        box-shadow: 0 4px 6px -1px var(--header-scrolled-shadow), 0 2px 4px -2px var(--header-scrolled-shadow);
    }

    #mobileThemeToggle {
        min-width: 2.5rem;
        min-height: 2.5rem;
    }

    .sidebar-nav-link {
        color: var(--text-muted);
        transition: background-color 0.2s, color 0.2s;
        cursor: pointer;
    }

    .sidebar-nav-link:hover {
        background-color: rgba(255, 255, 255, 0.05);
        color: var(--text-main);
    }

    .sidebar-nav-link.active {
        background-color: rgba(255, 255, 255, 0.07);
        color: var(--text-main);
        font-weight: 600;
        position: relative;
    }

    .sidebar-nav-link.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translateY(-50%);
        height: 60%;
        width: 4px;
        background-color: var(--accent-yellow);
        border-radius: 0 4px 4px 0;
    }

    .sidebar-nav-link.active i {
        color: var(--accent-yellow);
    }
    
    .header-link {
        color: var(--text);
        cursor: pointer;
    }

    .header-link:hover {
        color: var(--accent-yellow);
    }

    html[data-theme='light'] #mobileThemeToggle .theme-icon-dark {
        color: var(--navy) !important;
    }

    html[data-theme='light'] #mobileThemeToggle {
        background-color: var(--card-bg);
        border-color: var(--card-border);
    }
</style>

<div id="sidebar-overlay" class="fixed inset-0 bg-black/60 z-[98] hidden"></div>

<aside id="sidebar" class="fixed top-0 left-0 h-full w-64 bg-[var(--navy)] z-[99] transform -translate-x-full transition-transform duration-300 ease-in-out flex flex-col shadow-2xl shadow-black">

    <div class="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
        <a href="#overview" class="flex items-center gap-2">
            <img src="./assets/image/logo/faicon.png" alt="zeyverse" class="h-9 w-9 object-contain rounded-sm bg-white/5 p-1">

            <div>
                <div class="font-extrabold text-[17px] leading-tight text-white">
                    <span style="color:var(--accent-blue)">ZEY</span><span style="color:var(--accent-yellow)">VERSE</span>
                </div>
            </div>
        </a>

        <div class="flex items-center gap-2">
            <button id="closeSidebarBtn" class="p-2 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition">
                <i class="fa-solid fa-xmark h-5 w-5"></i>
            </button>
        </div>
    </div>

    <div class="flex-grow overflow-y-auto">

        <div class="px-4 mt-6 mb-2">
            <p class="text-xs font-semibold tracking-wider text-slate-500 uppercase">
                ADMIN MENU
            </p>
        </div>

        <nav class="sidebar-links">
            <a href="#overview" class="sidebar-nav-link flex items-center gap-4 px-4 py-3 text-sm rounded-lg mx-2 active">
                <i class="fa-solid fa-chart-pie w-5 text-center"></i>
                <span>OVERVIEW</span>
            </a>

            <a href="#students" class="sidebar-nav-link flex items-center gap-4 px-4 py-3 text-sm rounded-lg mx-2">
                <i class="fa-solid fa-users w-5 text-center"></i>
                <span>DATA SISWA</span>
            </a>

            <a href="#questions" class="sidebar-nav-link flex items-center gap-4 px-4 py-3 text-sm rounded-lg mx-2">
                <i class="fa-solid fa-book-open w-5 text-center"></i>
                <span>BANK SOAL</span>
            </a>

            <a href="#stats" class="sidebar-nav-link flex items-center gap-4 px-4 py-3 text-sm rounded-lg mx-2">
                <i class="fa-solid fa-square-poll-vertical w-5 text-center"></i>
                <span>HASIL & STATISTIK</span>
            </a>

            <a href="#account" class="sidebar-nav-link flex items-center gap-4 px-4 py-3 text-sm rounded-lg mx-2">
                <i class="fa-solid fa-user-gear w-5 text-center"></i>
                <span>PENGATURAN AKUN</span>
            </a>
        </nav>

    </div>

    <div class="p-4 mt-auto border-t border-white/10 shrink-0">
        <div class="flex flex-col gap-2">
            <button id="sidebarLogoutBtn" class="w-full text-center px-4 py-2 text-sm font-semibold text-[var(--navy)] bg-[var(--accent-yellow)] rounded-lg hover:bg-yellow-400 transition">
                LOGOUT
            </button>
        </div>
    </div>

</aside>

<header id="header-outer" class="fixed w-full z-50 top-0 transition-all duration-300">

    <div class="max-w-6xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 transition-all duration-300">

        <a href="#overview" class="flex-shrink-0 flex items-center gap-2">

            <img src="./assets/image/logo/faicon.png"
                 alt="zeyverse"
                 class="h-9 w-9 object-contain rounded-sm bg-white/5 p-1">

            <div>
                <div class="font-extrabold text-[17px] leading-tight text-main">
                    <span style="color:var(--accent-blue)">ZEY</span><span style="color:var(--accent-yellow)">VERSE</span>
                </div>
            </div>

        </a>

        <nav class="hidden lg:flex items-center gap-5 xl:gap-6">

            <a href="#overview"
               class="header-link flex items-center gap-2 text-sm font-semibold transition">
                <i class="fa-solid fa-chart-pie w-5 text-center"></i>
                <span>OVERVIEW</span>
            </a>

            <a href="#students"
               class="header-link flex items-center gap-2 text-sm font-semibold text-muted-color transition">
                <i class="fa-solid fa-users w-5 text-center"></i>
                <span>DATA SISWA</span>
            </a>

            <a href="#questions"
               class="header-link flex items-center gap-2 text-sm font-semibold text-muted-color transition">
                <i class="fa-solid fa-book-open w-5 text-center"></i>
                <span>BANK SOAL</span>
            </a>

            <a href="#stats"
               class="header-link flex items-center gap-2 text-sm font-semibold text-muted-color transition">
                <i class="fa-solid fa-square-poll-vertical w-5 text-center"></i>
                <span>HASIL & STATISTIK</span>
            </a>

            <a href="#account"
               class="header-link flex items-center gap-2 text-sm font-semibold text-muted-color transition">
                <i class="fa-solid fa-user-gear w-5 text-center"></i>
                <span>PENGATURAN AKUN</span>
            </a>

        </nav>

        <div class="flex items-center gap-3">

            <button id="mobileThemeToggle"
                    class="p-2 rounded-md bg-card-color border border-card-color hover:bg-white/10 transition flex items-center justify-center">

                <i class="fas fa-sun theme-icon-light text-[var(--accent-yellow)] hidden"></i>
                <i class="fas fa-moon theme-icon-dark text-[var(--accent-yellow)]"></i>

            </button>

            <button id="sidebarBtn"
                    class="p-2 rounded-md bg-[var(--accent-yellow)] hover:bg-yellow-400 transition lg:hidden">

                <svg xmlns="http://www.w3.org/2000/svg"
                     class="h-6 w-6 text-[var(--navy)]"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor">

                    <path stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M4 6h16M4 12h16M4 18h16"/>

                </svg>

            </button>

        </div>

    </div>

</header>

<script>
document.addEventListener('DOMContentLoaded', function() {

    const html = document.documentElement;
    const headerOuter = document.getElementById('header-outer');

    const sidebar = document.getElementById('sidebar');
    const sidebarBtn = document.getElementById('sidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    const sidebarLinks = document.querySelectorAll(
        '.sidebar-links a[href^="#"]'
    );

    sidebarBtn.addEventListener('click', function() {
        sidebar.classList.remove('-translate-x-full');
        sidebarOverlay.classList.remove('hidden');
    });

    closeSidebarBtn.addEventListener('click', function() {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    });

    sidebarOverlay.addEventListener('click', function() {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    });

    sidebarLinks.forEach(link => {

        link.addEventListener('click', function() {

            sidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('hidden');

            document.querySelectorAll('.sidebar-nav-link')
                .forEach(l => l.classList.remove('active'));

            this.classList.add('active');

        });

    });

    function checkScroll() {

        if (window.scrollY > 20) {
            headerOuter.classList.add('scrolled');
        } else {
            headerOuter.classList.remove('scrolled');
        }

    }

    checkScroll();

    window.addEventListener('scroll', checkScroll);

});
</script>
