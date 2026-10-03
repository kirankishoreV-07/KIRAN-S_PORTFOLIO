import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase);

// One motion vocabulary for the whole film: a long, soft landing for reveals
// and a symmetrical camera-move curve for scene-scale changes.
CustomEase.create('cine', '0.16, 1, 0.3, 1');
CustomEase.create('cineInOut', '0.76, 0, 0.24, 1');

export const DUR = { micro: 0.25, reveal: 1.15, scene: 1.4 } as const;

export { gsap, ScrollTrigger, SplitText };
