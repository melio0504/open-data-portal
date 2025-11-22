import { Hono } from "hono";
import { html } from "hono/html";
import { Layout } from "../components/Layout";

const app = new Hono();

app.get("/", async (c) => {
  const breadcrumbs = [{ label: "Home", href: "/" }, { label: "Categories" }];

  const content = html`
    <div class="container-custom pt-4 pb-8">
        <h1 class="text-3xl font-bold text-neutral-900 mb-8">Browse Categories</h1>
        <div id="categories-loading" class="text-center py-12">
            <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p class="mt-4 text-neutral-600">Loading categories...</p>
        </div>

        <div id="categories-error" class="hidden bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <i data-lucide="alert-circle" class="w-12 h-12 text-red-600 mx-auto mb-3"></i>
            <p class="text-red-800 font-medium">Failed to load categories</p>
            <button onclick="loadCategories()" class="mt-3 text-primary-600 hover:text-primary-700 font-medium">Try again</button>
        </div>

        <div id="categories-grid" class="hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Categories will be loaded here -->
        </div>
    </div>

    <script>
        async function loadCategories() {
            const loading = document.getElementById('categories-loading');
            const error = document.getElementById('categories-error');
            const grid = document.getElementById('categories-grid');

            loading.classList.remove('hidden');
            error.classList.add('hidden');
            grid.classList.add('hidden');

            try {
                const response = await fetch('/api/v1/categories');
                const data = await response.json();

                if (data.success && data.data) {
                    displayCategories(data.data);
                    loading.classList.add('hidden');
                    grid.classList.remove('hidden');
                } else {
                    throw new Error('Failed to load categories');
                }
            } catch (err) {
                console.error('Error loading categories:', err);
                loading.classList.add('hidden');
                error.classList.remove('hidden');
            }
        }

        function displayCategories(categories) {
            const grid = document.getElementById('categories-grid');
            grid.innerHTML = categories.map(category => \`
                <div class="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm flex flex-col">
                    <h3 class="text-xl font-bold text-neutral-900 mb-3">\${category.name}</h3>
                    <div class="flex-grow mb-4">
                        \${category.description ? \`<p class="text-neutral-700 leading-relaxed">\${category.description}</p>\` : \`<p class="text-neutral-500 italic">No description available</p>\`}
                    </div>
                    <div class="flex items-center space-x-4 text-base font-semibold text-neutral-700 mt-auto">
                        <div class="flex items-center space-x-1.5">
                            <i data-lucide="database" class="w-5 h-5 text-primary-600"></i>
                            <span>\${category.dataset_count} dataset\${category.dataset_count !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="flex items-center space-x-1.5">
                            <i data-lucide="file" class="w-5 h-5 text-blue-600"></i>
                            <span>\${category.resource_count} resource\${category.resource_count !== 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>
            \`).join('');

            // Reinitialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        }

        // Load categories on page load
        loadCategories();
    </script>
  `;

  return c.html(
    Layout({
      title: "Browse Categories - Open Data Portal",
      children: content,
      breadcrumbs,
    }),
  );
});

export default app;
