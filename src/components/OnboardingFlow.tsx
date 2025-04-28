import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";
import countries from "world-countries";

interface OnboardingFlowProps {
  onComplete?: (userData: any) => void;
}

interface UserData {
  age: string;
  country: string;
  genderIdentity: string;
  citizenship: string;
  schoolStatus: string;
  degreeType: string;
  yearOfStudy: string;
  fieldOfStudy: string;
  gpa: string;
  incomeBracket: string;
  financialNeed: boolean;
  ethnicity: string;
  identifiers: string[];
}

const FormGroup = ({ children }: { children: React.ReactNode }) => (
  <div className="flex flex-col space-y-2">{children}</div>
);

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete = () => {} }) => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [userData, setUserData] = useState<UserData>({
    age: "",
    country: "",
    genderIdentity: "",
    citizenship: "",
    schoolStatus: "",
    degreeType: "",
    yearOfStudy: "",
    fieldOfStudy: "",
    gpa: "",
    incomeBracket: "",
    financialNeed: false,
    ethnicity: "",
    identifiers: [],
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      setProgress(((step + 1) / totalSteps) * 100);
    } else {
      const finalUserProfile = {
        age: Number(userData.age),
        country: userData.country,
        gender: userData.genderIdentity,
        citizenship: userData.citizenship,
        education: userData.schoolStatus,
        degreeType: userData.degreeType,
        yearOfStudy: userData.yearOfStudy,
        fieldOfStudy: userData.fieldOfStudy,
        gpa: userData.gpa,
        incomeBracket: userData.incomeBracket,
        financialNeed: userData.financialNeed,
        ethnicity: userData.ethnicity,
        identifiers: userData.identifiers,
      };
      onComplete(finalUserProfile);
      navigate("/dashboard", { state: finalUserProfile });
    }
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/");
    } else {
      setStep(step - 1);
      setProgress(((step - 1) / totalSteps) * 100);
    }
  };

  const updateUserData = (field: keyof UserData, value: any) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (item: string) => {
    setUserData((prev) => {
      const updated = [...prev.identifiers];
      const index = updated.indexOf(item);
      if (index === -1) updated.push(item);
      else updated.splice(index, 1);
      return { ...prev, identifiers: updated };
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, transition: { duration: 0.3 } },
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <CardHeader><CardTitle className="text-2xl font-bold text-center">Tell us about yourself</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormGroup>
                <Label>Age</Label>
                <Input type="number" value={userData.age} onChange={(e) => updateUserData("age", e.target.value)} />
              </FormGroup>
              <FormGroup>
                <Label>Country of Residence</Label>
                <Select value={userData.country} onValueChange={(value) => updateUserData("country", value)}>
                  <SelectTrigger><SelectValue placeholder="Select your country" /></SelectTrigger>
                  <SelectContent>
                    {[...countries].sort((a, b) => a.name.common.localeCompare(b.name.common)).map((c) => (
                      <SelectItem key={c.cca2} value={c.name.common}>{c.name.common}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormGroup>
            </CardContent>
          </motion.div>
        );

      case 2:
        return (
          <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <CardHeader><CardTitle className="text-2xl font-bold text-center">Identity Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormGroup>
                <Label>Gender</Label>
                <RadioGroup value={userData.genderIdentity} onValueChange={(value) => updateUserData("genderIdentity", value)} className="grid grid-cols-2 gap-2">
                  {['woman', 'man', 'non-binary', 'prefer-not-to-say'].map((g) => (
                    <div key={g} className="flex items-center space-x-2">
                      <RadioGroupItem value={g} id={g} />
                      <Label htmlFor={g}>{g.replace('-', ' ')}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormGroup>
              <FormGroup>
                <Label>Residency/Citizenship</Label>
                <Input value={userData.citizenship} onChange={(e) => updateUserData("citizenship", e.target.value)} placeholder="Ex: Canadian citizen, PR" />
              </FormGroup>
            </CardContent>
          </motion.div>
        );

      case 3:
        return (
          <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <CardHeader><CardTitle className="text-2xl font-bold text-center">Education Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormGroup>
                <Label>Current Education Status</Label>
                <Select value={userData.schoolStatus} onValueChange={(value) => updateUserData("schoolStatus", value)}>
                  <SelectTrigger><SelectValue placeholder="Select education status" /></SelectTrigger>
                  <SelectContent>
                    {['high-school', 'undergraduate', 'graduate', 'not-in-school'].map((s) => (
                      <SelectItem key={s} value={s}>{s.replace('-', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormGroup>

              {(userData.schoolStatus === 'undergraduate' || userData.schoolStatus === 'graduate') && (
                <>
                  <FormGroup>
                    <Label>Degree Type</Label>
                    <Input value={userData.degreeType} onChange={(e) => updateUserData("degreeType", e.target.value)} placeholder="Ex: Bachelor's, Master's" />
                  </FormGroup>
                  <FormGroup>
                    <Label>Year of Study</Label>
                    <Input value={userData.yearOfStudy} onChange={(e) => updateUserData("yearOfStudy", e.target.value)} placeholder="Ex: 2nd year, Final year" />
                  </FormGroup>
                </>
              )}
            </CardContent>
          </motion.div>
        );

      case 4:
        return (
          <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <CardHeader><CardTitle className="text-2xl font-bold text-center">Academic Details</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormGroup>
                <Label>Field of Study</Label>
                <Input value={userData.fieldOfStudy} onChange={(e) => updateUserData("fieldOfStudy", e.target.value)} placeholder="Ex: Computer Science, Engineering" />
              </FormGroup>
              <FormGroup>
                <Label>Current GPA</Label>
                <Input value={userData.gpa} onChange={(e) => updateUserData("gpa", e.target.value)} placeholder="Ex: 3.8 / 4.0" />
              </FormGroup>
            </CardContent>
          </motion.div>
        );

      case 5:
        return (
          <motion.div key="step5" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <CardHeader><CardTitle className="text-2xl font-bold text-center">Financial & Ethnicity</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <FormGroup>
                <Label>Household Income</Label>
                <Select value={userData.incomeBracket} onValueChange={(value) => {updateUserData("incomeBracket", value);updateUserData("financialNeed", value === "under-25k");}}>
                  <SelectTrigger><SelectValue placeholder="Select income" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-25k">Under $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-75k">$50,000 - $75,000</SelectItem>
                    <SelectItem value="75k-100k">$75,000 - $100,000</SelectItem>
                    <SelectItem value="over-100k">Over $100,000</SelectItem>
                  </SelectContent>
                </Select>
              </FormGroup>
              <FormGroup>
                <Label>Ethnicity</Label>
                <Input value={userData.ethnicity} onChange={(e) => updateUserData("ethnicity", e.target.value)} placeholder="Ex: South Asian, Hispanic, Black" />
              </FormGroup>
            </CardContent>
          </motion.div>
        );

      case 6:
        return (
          <motion.div key="step6" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <CardHeader><CardTitle className="text-2xl font-bold text-center">Additional Identifiers</CardTitle></CardHeader>
            <CardContent>
              <FormGroup>
                <Label>Select all that apply</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {["BIPOC", "LGBTQ+", "First Generation Student", "Low Income", "Newcomer/Immigrant", "Person with Disability", "Indigenous", "Veteran"].map((id) => (
                    <div key={id} className="flex items-center space-x-2">
                      <Checkbox id={id} checked={userData.identifiers.includes(id)} onCheckedChange={() => toggleArrayItem(id)} />
                      <Label htmlFor={id}>{id}</Label>
                    </div>
                  ))}
                </div>
              </FormGroup>
            </CardContent>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-background">
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>Step {step} of {totalSteps}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>
      <Card>
        {renderStep()}
        <CardFooter className="flex justify-between pt-6">
          <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          <Button onClick={handleNext} className="flex items-center gap-2">
            {step === totalSteps ? (<><Check className="h-4 w-4" /> Complete</>) : (<><ChevronRight className="h-4 w-4" /> Next</>)}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingFlow;