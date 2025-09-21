const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

const blobURLtoBlob = async (blobUrl: string): Promise<Blob> => {
    const response = await fetch(blobUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch blob from URL: ${response.statusText}`);
    }
    return await response.blob();
}

export const uploadToDrive = async (fileUrl: string, fileName: string): Promise<string> => {
    try {
        let blob: Blob;

        if (fileUrl.startsWith('data:')) {
            blob = dataURLtoBlob(fileUrl);
        } else if (fileUrl.startsWith('blob:')) {
            blob = await blobURLtoBlob(fileUrl);
        } else {
            throw new Error('Unsupported file URL format');
        }

        const metadata = {
            name: fileName,
            mimeType: blob.type,
            parents: ['root']
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', blob);

        const response = await gapi.client.request({
            path: 'https://www.googleapis.com/upload/drive/v3/files',
            method: 'POST',
            params: { uploadType: 'multipart' },
            body: form
        });
        
        if (response.status !== 200) {
            throw new Error(`Google Drive API responded with status ${response.status}`);
        }

        return response.result.id;

    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        throw new Error('Failed to upload file to Google Drive.');
    }
};
