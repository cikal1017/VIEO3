export interface ImageFile {
  base64: string;
  mimeType: string;
}

export interface GeneratedResult {
  imageUrl: string;
  text: string;
}

export interface VideoResult {
  videoUrl: string;
}

export interface GoogleUser {
    name: string;
    email: string;
    picture: string;
}
