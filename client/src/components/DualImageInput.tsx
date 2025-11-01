import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface DualImageInputProps {
  value?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  label?: string;
  description?: string;
}

export function DualImageInput({ value, onChange, onRemove, label = 'Logo / Image', description }: DualImageInputProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size must be less than 2MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onChange(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
    }
  };

  const isUrl = value && (value.startsWith('http://') || value.startsWith('https://'));

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}
      
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt={label}
            className="w-full h-48 object-cover rounded-lg border-2 border-border"
            data-testid="img-preview"
          />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={onRemove}
              data-testid="button-remove"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {isUrl && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <Link className="h-3 w-3" />
              URL
            </div>
          )}
        </div>
      ) : (
        <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'upload' | 'url')} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" data-testid="tab-upload">
              <Upload className="h-4 w-4 mr-2" />
              Upload Image
            </TabsTrigger>
            <TabsTrigger value="url" data-testid="tab-url">
              <Link className="h-4 w-4 mr-2" />
              Image URL
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
              data-testid="input-file"
            />
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors hover:border-primary hover:bg-accent/50
                ${isDragging ? 'border-primary bg-accent/50' : 'border-border'}
              `}
              data-testid="drop-zone"
            >
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <div className="p-4 rounded-full bg-accent">
                  <ImageIcon className="h-8 w-8" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium">Drop your image here or click to upload</p>
                  <p className="text-xs">PNG, JPG or WEBP (max 2MB)</p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="url" className="mt-2">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com/image.png"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                data-testid="input-url"
              />
              <Button
                type="button"
                onClick={handleUrlSubmit}
                disabled={!urlInput.trim()}
                data-testid="button-submit-url"
              >
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Enter a direct link to an image (HTTPS recommended for security)
            </p>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
