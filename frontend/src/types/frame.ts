export interface Photo {
  id: string;
  url: string;
  file?: File;
  order: number;
}

export type FrameColor = 'black' | 'white' | 'wood' | 'gold';
export type FrameSize = '16x18cm' | '21x30cm' | '30x40cm' | '50x70cm';

export interface FrameConfig {
  color: FrameColor;
  size: FrameSize;
}

export interface TextCustomization {
  firstName: string;
  secondName: string;
  date: string;
  giftNote?: string;
}

export interface FrameDesign {
  id?: string;
  userId?: string;
  name?: string;
  photos: Photo[];
  frameConfig: FrameConfig;
  textCustomization: TextCustomization;
  createdAt?: Date;
}
