function normalizeDomain(domain) {
    domain = domain.trim().toLowerCase();
    if (domain.startsWith("http://")) {
        domain = domain.substring(7);
    } else if (domain.startsWith("https://")) {
        domain = domain.substring(8);
    }
    if (domain.startsWith("www.")) {
        domain = domain.substring(4);
    }
    if (domain.endsWith("/")) {
        domain = domain.slice(0, -1);
    }
    console.log('нормализация домена')
    return domain;
}

function normalizeAndExport() {
    console.log('начало main')
    const inputText = document.getElementById('domainsInput').value;
    const lines = inputText.split('\n');
    const normalizedLines = lines.map(line => normalizeDomain(line)).filter(Boolean); // Удаляем пустые строки
    const uniqueDomains = [...new Set(normalizedLines)];

    const splitByCheckbox = document.getElementById('splitBy');
    const splitSize = splitByCheckbox.checked ? 200 : Infinity;

    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.innerHTML = '';

    let startRange = 1;

    for (let i = 0; i < uniqueDomains.length; i += splitSize) {
        
        // Создаём кнопки скачать и копировать для каждого окна с результатом
        const copyButton = document.createElement('button');
        const downloadButton = document.createElement('button');
        copyButton.type = 'button';
        downloadButton.type = 'button';
        copyButton.classList.add('copyButton');
        downloadButton.classList.add('downloadButton');
        copyButton.textContent = 'Скопировать';
        downloadButton.textContent = 'Скачать';

        // Создаём блок для результата
        const block = document.createElement('div');
        block.className = 'resultBlock';
        const textarea = document.createElement('textarea');
        textarea.value = uniqueDomains.slice(i, i + splitSize).join('\n');
        block.appendChild(textarea);

        // Создаём блок для кнопок скачать и копировать и лобавляем их в него
        const childButtons = document.createElement('div');
        childButtons.classList.add('child-buttons');
        block.append(childButtons);
        childButtons.append(copyButton);
        childButtons.append(downloadButton);

        if (splitByCheckbox.checked) {
            let endRange = Math.min(startRange + splitSize - 1, uniqueDomains.length);
            const divineCounter = document.createElement('p');
            divineCounter.classList.add('divive-counter');
            divineCounter.textContent = `${startRange}-${endRange}`
            block.prepend(divineCounter);
            startRange += splitSize;
        }

        resultsContainer.appendChild(block);

        block.querySelector('.copyButton').addEventListener('click', () => {
            navigator.clipboard.writeText(textarea.value);
        });

        block.querySelector('.downloadButton').addEventListener('click', () => {
            const csvContent = textarea.value;
            const blob = new Blob([csvContent], {type: "text/csv;charset=utf-8"});
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "unique_domains.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
}