import { useState } from 'react';

export default function Home() {
    const [fileContent, setFileContent] = useState('');
    const [status, setStatus] = useState('');

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) {
            setStatus('No file selected.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            setFileContent(content);
            setStatus('File uploaded successfully.');
            console.log('File Content:', content);
        };
        reader.readAsText(file);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Mina zkApp</h1>
            <input type="file" onChange={handleFileUpload} />
            <p>Status: {status}</p>
            <pre>{fileContent}</pre>
        </div>
    );
}
