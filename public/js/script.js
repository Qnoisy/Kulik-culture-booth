document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('news-form');

	if (form) {
		form.addEventListener('submit', async event => {
			event.preventDefault();

			const formData = new FormData(form);

			const response = await fetch('/add', {
				method: 'POST',
				body: formData,
			});

			if (response.ok) {
				const newsItem = await response.json();
				addNewsToDOM(newsItem);
				form.reset();
			} else {
				console.error('Failed to add news item');
			}
		});
	}

	function addNewsToDOM(newsItem) {
		const newsList = document.getElementById('news-list');
		const newsElement = document.createElement('li');
		newsElement.setAttribute('data-id', newsItem.id);

		let newsHTML = `
			<h2>${newsItem.title}</h2>
			<p>${newsItem.content}</p>
			<button class="btn btn-danger delete-news">Видалити</button>
		`;

		if (newsItem.image) {
			newsHTML += `<img src="${newsItem.image}" alt="${newsItem.title} Image" style="max-width: 300px; max-height: 200px;">`;
		}

		newsElement.innerHTML = newsHTML;
		newsList.appendChild(newsElement);
	}

	// Initial load of news items
	async function loadNews() {
		const response = await fetch('/news');
		const newsItems = await response.json();
		newsItems.forEach(newsItem => addNewsToDOM(newsItem));
	}

	if (document.getElementById('news-list')) {
		loadNews();
	}

	// Функціонал видалення
	document.addEventListener('click', async event => {
		if (event.target.classList.contains('delete-news')) {
			const newsElement = event.target.closest('li');
			const newsId = newsElement.getAttribute('data-id');

			const response = await fetch(`/delete/${newsId}`, {
				method: 'DELETE',
			});

			if (response.ok) {
				newsElement.remove();
			} else {
				console.error('Failed to delete news item');
			}
		}
	});

	const galleryContainer = document.getElementById('news-content');
	if (galleryContainer) {
		async function loadGallery() {
			const response = await fetch('/news');
			const galleryItems = await response.json();
			galleryItems.forEach((item, index) => {
				const isActive = index === 0 ? 'active' : '';
				const galleryHTML = `
					<div class="carousel-item ${isActive}">
						<div class="gallery-item ">
							<img src="${item.image}" class="d-block w-100" alt="${item.title}">
							<div class="carousel-caption d-none d-md-block">
								<h5 class="text-white">${item.title}</h5>
								<p>${item.content}</p>
							</div>
						</div>
					</div>
				`;
				galleryContainer.innerHTML += galleryHTML;
			});
		}

		loadGallery();
	}
});
