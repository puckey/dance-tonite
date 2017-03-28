import { getUrlParameter } from './url';

export const isMobile = /android|iPad|webOS|iPhone|iPod|IEMobile/i
    .test(navigator.userAgent);

export const isApp = /crosswalk/i
    .test(navigator.userAgent) || !!getUrlParameter('app');
