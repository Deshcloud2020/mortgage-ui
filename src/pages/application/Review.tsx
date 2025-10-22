import { ApplicationProgress } from "@/components/ApplicationProgress";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useApplication } from "@/contexts/ApplicationContext";
import { ArrowLeft, Edit, Home, Upload } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Review = () => {
  const navigate = useNavigate();
  const { applicationData, calculateDTI } = useApplication();
  const [certifyTruth, setCertifyTruth] = useState(false);
  const [authorizeCreditCheck, setAuthorizeCreditCheck] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!certifyTruth || !authorizeCreditCheck) {
      toast.error("Please accept both certifications to continue");
      return;
    }

    setIsSubmitting(true);
    toast.loading("Analyzing your information...");

    // Simulate API call
    setTimeout(() => {
      toast.dismiss();
      toast.success("Prequalification complete!");
      navigate("/application/results");
    }, 2000);
  };

  const dti = calculateDTI();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/application/property")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Home className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-primary">uSign</span>
              </div>
            </div>
            <Button variant="ghost" size="sm">Help</Button>
          </div>
        </div>
      </header>

      <div className="container max-w-4xl mx-auto px-4 py-8">
        <ApplicationProgress currentStep={7} totalSteps={7} />

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Review Your Information</CardTitle>
            <CardDescription>
              Verify details before we generate your prequalification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="personal">
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="font-semibold">Personal Information</span>
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
                      <p className="text-sm text-muted-foreground">Name</p>
                      <p className="font-medium">{applicationData.personalInfo.firstName} {applicationData.personalInfo.lastName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{applicationData.personalInfo.dateOfBirth || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{applicationData.personalInfo.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{applicationData.personalInfo.phone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
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
                      <span className="font-semibold">Employment & Income</span>
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
                      <p className="text-sm text-muted-foreground">Employment Status</p>
                      <p className="font-medium capitalize">{applicationData.employment.status}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Monthly Income</p>
                      <p className="font-medium">${applicationData.employment.monthlyIncome.toLocaleString()}</p>
                    </div>
                    {applicationData.employment.employer && (
                      <div>
                        <p className="text-sm text-muted-foreground">Employer</p>
                        <p className="font-medium">{applicationData.employment.employer}</p>
                      </div>
                    )}
                    {applicationData.employment.additionalIncome && applicationData.employment.additionalIncome > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Additional Income</p>
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
                      <span className="font-semibold">Assets & Down Payment</span>
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
                      <p className="text-sm text-muted-foreground">Down Payment</p>
                      <p className="font-medium">${applicationData.assets.downPayment.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Checking Accounts</p>
                      <p className="font-medium">${applicationData.assets.checkingAccounts.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Savings Accounts</p>
                      <p className="font-medium">${applicationData.assets.savingsAccounts.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Assets</p>
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
                      <span className="font-semibold">Monthly Debts</span>
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
                      <p className="text-sm text-muted-foreground">Total Monthly Debts</p>
                      <p className="font-medium">
                        ${(applicationData.debts.creditCards + applicationData.debts.carLoans + applicationData.debts.studentLoans + applicationData.debts.otherDebts).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Debt-to-Income Ratio</p>
                      <p className={`font-medium ${dti < 36 ? 'text-green-600' : dti < 43 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {dti.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Optional: Upload Supporting Documents</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Speeds up full approval later
              </p>
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">Drag & drop files here</p>
                <p className="text-xs text-muted-foreground mb-4">or click to browse</p>
                <Button variant="outline" size="sm">Browse Files</Button>
                <p className="text-xs text-muted-foreground mt-4">
                  Accepted: PDF, JPG, PNG (Max 10MB each)
                </p>
              </div>
              <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                <p>Suggested documents:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Recent pay stubs (last 30 days)</li>
                  <li>Bank statements (last 2 months)</li>
                  <li>Tax returns (last 2 years)</li>
                  <li>ID (driver's license or passport)</li>
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
                  I certify that the information provided is true and accurate to the best of my knowledge
                </label>
              </div>
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="authorizeCreditCheck"
                  checked={authorizeCreditCheck}
                  onCheckedChange={(checked) => setAuthorizeCreditCheck(checked as boolean)}
                />
                <label htmlFor="authorizeCreditCheck" className="text-sm cursor-pointer">
                  I authorize a soft credit check (won't affect credit score)
                </label>
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={() => navigate("/application/property")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!certifyTruth || !authorizeCreditCheck || isSubmitting}
                size="lg"
              >
                Generate My Prequalification
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Review;
