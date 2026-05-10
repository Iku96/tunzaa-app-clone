import { cleanseImageUrl, isValidUrl } from '../images';

describe('Image Utilities Safety Suite', () => {
    
    describe('cleanseImageUrl Logic', () => {
        it('SHOULD strip Linode presigned query parameters cleanly', () => {
            const tainted = 'https://tunzaa-bucket.linodeobjects.com/avatars/user123.png?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ABC&X-Amz-Signature=123';
            const expected = 'https://tunzaa-bucket.linodeobjects.com/avatars/user123.png';
            
            expect(cleanseImageUrl(tainted)).toBe(expected);
        });

        it('SHOULD strip generic AWS/S3 presigned query parameters even if not linode domain', () => {
            const s3Tainted = 'https://my-bucket.s3.amazonaws.com/avatars/user.png?X-Amz-Algorithm=AWS4&X-Amz-Signature=999';
            const expected = 'https://my-bucket.s3.amazonaws.com/avatars/user.png';
            expect(cleanseImageUrl(s3Tainted)).toBe(expected);
        });

        it('SHOULD PRESERVE normal parameters for external CDNs (like gravatar/unsplash)', () => {
            const external = 'https://images.unsplash.com/photo-12345?w=400&h=400&q=80';
            
            expect(cleanseImageUrl(external)).toBe(external);
        });

        it('SHOULD return undefined gracefully for null/missing inputs', () => {
            expect(cleanseImageUrl(undefined)).toBeUndefined();
            expect(cleanseImageUrl('')).toBeUndefined();
            expect(cleanseImageUrl(null as any)).toBeUndefined();
        });

        it('SHOULD return basic non-linode strings untouched', () => {
            const standard = 'https://mydomain.com/photo.jpg';
            expect(cleanseImageUrl(standard)).toBe(standard);
        });
    });

    describe('isValidUrl Logic', () => {
        it('SHOULD validate https correctly', () => {
            expect(isValidUrl('https://site.com')).toBe(true);
        });
        
        it('SHOULD validate http correctly', () => {
            expect(isValidUrl('http://site.com')).toBe(true);
        });

        it('SHOULD invalidate non-url strings', () => {
            expect(isValidUrl('not-a-url')).toBe(false);
            expect(isValidUrl('/relative/path')).toBe(false);
            expect(isValidUrl('')).toBe(false);
        });
    });
});
