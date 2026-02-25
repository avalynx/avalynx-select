document.addEventListener('DOMContentLoaded', () => {
	const modeToggle = document.getElementById('modeToggle');
	if (modeToggle !== null) {
		modeToggle.addEventListener('click', () => {
			const currentTheme = document.documentElement.getAttribute('data-bs-theme');
			const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
			document.documentElement.setAttribute('data-bs-theme', newTheme);
			modeToggle.textContent = `Toggle to ${newTheme === 'dark' ? 'Light' : 'Dark'} Mode`;

			const hljsTheme = document.getElementById('hljsTheme');
			if (hljsTheme !== null) {
				cssTheme = newTheme === 'light' ? 'stackoverflow-light' : 'stackoverflow-dark';
				hljsTheme.setAttribute('href', `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9/build/styles/${cssTheme}.min.css`);
			}
		});
	}

	const copyButtons = document.querySelectorAll('.copyButton');
	if (copyButtons !== null) {
		copyButtons.forEach(button => {
			button.addEventListener('click', () => {
				const codeBlockId = button.getAttribute('data-code-block');
				const codeBlock = document.getElementById(codeBlockId);
				if (codeBlock !== null) {
					const code = codeBlock.innerText;
					navigator.clipboard.writeText(code).then(() => {
						const originalText = button.textContent;
						button.textContent = 'Copied!';
						setTimeout(() => {
							button.textContent = originalText;
						}, 2000);
					}).catch(err => {
						console.error('Error copying text: ', err);
					});
				}
			});
		});
	}
});
