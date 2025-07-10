export interface GameConfig {
  gameTitle: string;
  images: {
    image1: string;
    image2: string;
  };
  differences: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
} 