import { ApplicationProgress } from "@/components/ApplicationProgress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useApplication } from "@/contexts/ApplicationContext";
import { ArrowLeft, Edit, FileText, Home, Image as ImageIcon, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
}

const Review = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { applicationData, calculateDTI } = useApplication();
  const [certifyTruth, setCertifyTruth] = useState(false);
  const [authorizeCreditCheck, setAuthorizeCreditCheck] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    if (!certifyTruth || !authorizeCreditCheck) {
      toast.error(t('review.certifications.error'));
      return;
    }

    setIsSubmitting(true);
    toast.loading(t('review.toast.analyzing'));

    // Simulate API call with file upload
    setTimeout(() => {
      toast.dismiss();
      if (uploadedFiles.length > 0) {
        toast.success(t('review.toast.submitted', { count: uploadedFiles.length }));
      } else {
        toast.success(t('review.toast.submittedNoFiles'));
      }
      navigate("/application/results");
    }, 2000);
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const validFiles: UploadedFile[] = [];
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

    Array.from(files).forEach((file) => {
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        toast.error(t('review.fileUpload.invalidType', { fileName: file.name }));
        return;
      }

      // Validate file size
      if (file.size > maxSize) {
        toast.error(t('review.fileUpload.tooLarge', { fileName: file.name }));
        return;
      }

      // Check total files limit
      if (uploadedFiles.length + validFiles.length >= 20) {
        toast.error(t('review.fileUpload.maxFiles'));
        return;
      }

      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          validFiles.push({
            file,
            id: fileId,
            preview: e.target?.result as string,
          });

          if (validFiles.length === Array.from(files).filter(f =>
            allowedTypes.includes(f.type) && f.size <= maxSize
          ).length) {
            setUploadedFiles(prev => [...prev, ...validFiles]);
            toast.success(t('review.fileUpload.success', { count: validFiles.length }));
          }
        };
        reader.readAsDataURL(file);
      } else {
        validFiles.push({
          file,
          id: fileId,
        });
      }
    });

    // Add non-image files immediately
    const nonImageFiles = validFiles.filter(f => !f.file.type.startsWith('image/'));
    if (nonImageFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...nonImageFiles]);
      toast.success(t('review.fileUpload.success', { count: nonImageFiles.length }));
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemoveFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    toast.success(t('review.fileUpload.removed'));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const dti = calculateDTI();

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <ApplicationProgress currentStep={7} totalSteps={7} />

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('review.title')}</CardTitle>
          <CardDescription>
            {t('review.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="personal">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="font-semibold">{t('review.sections.personalInfo.title')}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/application/personal-info");
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('review.sections.personalInfo.name')}</p>
                    <p className="font-medium">{applicationData.personalInfo.firstName} {applicationData.personalInfo.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('review.sections.personalInfo.dateOfBirth')}</p>
                    <p className="font-medium">{applicationData.personalInfo.dateOfBirth || t('common.notProvided')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('review.sections.personalInfo.email')}</p>
                    <p className="font-medium">{applicationData.personalInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('review.sections.personalInfo.phone')}</p>
                    <p className="font-medium">{applicationData.personalInfo.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-sm text-muted-foreground">{t('review.sections.personalInfo.address')}</p>
                    <p className="font-medium">
                      {applicationData.personalInfo.address}, {applicationData.personalInfo.city}, {applicationData.personalInfo.state} {applicationData.personalInfo.zipCode}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="employment">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="font-semibold">{t('review.sections.employment.title')}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/application/employment");
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('review.sections.employment.employmentStatus')}</p>
                    <p className="font-medium capitalize">{applicationData.employment.status}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('review.sections.employment.monthlyIncome')}</p>
                    <p className="font-medium">${applicationData.employment.monthlyIncome.toLocaleString()}</p>
                  </div>
                  {applicationData.employment.employer && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('review.sections.employment.employer')}</p>
                      <p className="font-medium">{applicationData.employment.employer}</p>
                    </div>
                  )}
                  {applicationData.employment.additionalIncome && applicationData.employment.additionalIncome > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground">{t('review.sections.employment.additionalIncome')}</p>
                      <p className="font-medium">${applicationData.employment.additionalIncome.toLocaleString()}</p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="assets">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="font-semibold">{t('review.sections.assets.title')}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/application/assets");
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('review.sections.assets.downPayment')}</p>
                    <p className="font-medium">${applicationData.assets.downPayment.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('review.sections.assets.checkingAccounts')}</p>
                    <p className="font-medium">${applicationData.assets.checkingAccounts.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('review.sections.assets.savingsAccounts')}</p>
                    <p className="font-medium">${applicationData.assets.savingsAccounts.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('review.sections.assets.totalAssets')}</p>
                    <p className="font-medium">
                      ${(applicationData.assets.checkingAccounts + applicationData.assets.savingsAccounts + applicationData.assets.investments + applicationData.assets.retirement).toLocaleString()}
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="debts">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-green-600">✓</span>
                    <span className="font-semibold">{t('review.sections.debts.title')}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/application/debts");
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{t('review.sections.debts.totalMonthlyDebts')}</p>
                    <p className="font-medium">
                      ${(applicationData.debts.creditCards + applicationData.debts.carLoans + applicationData.debts.studentLoans + applicationData.debts.otherDebts).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t('review.sections.debts.dtiRatio')}</p>
                    <p className={`font-medium ${dti < 36 ? 'text-green-600' : dti < 43 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {dti.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">{t('review.documentUpload.title')}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t('review.documentUpload.subtitle')}
            </p>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />

            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragging
                ? 'border-primary bg-primary/5'
                : 'border-muted-foreground/25 hover:border-primary'
                }`}
            >
              <Upload className={`h-12 w-12 mx-auto mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
              <p className="text-sm font-medium mb-2">
                {isDragging ? t('review.documentUpload.dropHere') : t('review.documentUpload.dragDrop')}
              </p>
              <p className="text-xs text-muted-foreground mb-4">{t('review.documentUpload.orClick')}</p>
              <Button variant="outline" size="sm" type="button" onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}>
                {t('review.documentUpload.browseButton')}
              </Button>
              <p className="text-xs text-muted-foreground mt-4">
                {t('review.documentUpload.acceptedFormats')}
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">
                  {t('review.documentUpload.uploadedFiles', { count: uploadedFiles.length })}
                </p>
                <div className="space-y-2">
                  {uploadedFiles.map((uploadedFile) => (
                    <div
                      key={uploadedFile.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {uploadedFile.file.type === 'application/pdf' ? (
                          <FileText className="h-8 w-8 text-red-500 flex-shrink-0" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-blue-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {uploadedFile.file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(uploadedFile.file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFile(uploadedFile.id)}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('review.documentUpload.totalSize', { size: formatFileSize(uploadedFiles.reduce((sum, f) => sum + f.file.size, 0)) })}
                </p>
              </div>
            )}

            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <p>{t('review.documentUpload.suggestedTitle')}</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>{t('review.documentUpload.suggested.payStubs')}</li>
                <li>{t('review.documentUpload.suggested.bankStatements')}</li>
                <li>{t('review.documentUpload.suggested.taxReturns')}</li>
                <li>{t('review.documentUpload.suggested.id')}</li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-6 space-y-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="certifyTruth"
                checked={certifyTruth}
                onCheckedChange={(checked) => setCertifyTruth(checked as boolean)}
              />
              <label htmlFor="certifyTruth" className="text-sm cursor-pointer">
                {t('review.certifications.certifyTruth')}
              </label>
            </div>
            <div className="flex items-start space-x-3">
              <Checkbox
                id="authorizeCreditCheck"
                checked={authorizeCreditCheck}
                onCheckedChange={(checked) => setAuthorizeCreditCheck(checked as boolean)}
              />
              <label htmlFor="authorizeCreditCheck" className="text-sm cursor-pointer">
                {t('review.certifications.authorizeCreditCheck')}
              </label>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={() => navigate("/application/property")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!certifyTruth || !authorizeCreditCheck || isSubmitting}
              size="lg"
            >
              {t('review.submitButton.submit')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </div >
  );
};

export default Review;
