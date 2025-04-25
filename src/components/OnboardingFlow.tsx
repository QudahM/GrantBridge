import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronRight, ChevronLeft, Check } from "lucide-react";

interface OnboardingFlowProps {
  onComplete?: (userData: UserData) => void;
}

interface UserData {
  age: string;
  country: string;
  schoolStatus: string;
  genderIdentity: string;
  incomeBracket: string;
  fieldsOfInterest: string[];
  identifiers: string[];
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  onComplete = () => {},
}) => {
  const [step, setStep] = useState(1);
  const [progress, setProgress] = useState(20);
  const [userData, setUserData] = useState<UserData>({
    age: "",
    country: "",
    schoolStatus: "",
    genderIdentity: "",
    incomeBracket: "",
    fieldsOfInterest: [],
    identifiers: [],
  });

  const totalSteps = 5;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      setProgress(((step + 1) / totalSteps) * 100);
    } else {
      onComplete(userData);
      navigate("/dashboard");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setProgress(((step - 1) / totalSteps) * 100);
    }
  };

  const updateUserData = (field: keyof UserData, value: any) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (
    field: "fieldsOfInterest" | "identifiers",
    item: string,
  ) => {
    setUserData((prev) => {
      const currentArray = [...prev[field]];
      const index = currentArray.indexOf(item);

      if (index === -1) {
        currentArray.push(item);
      } else {
        currentArray.splice(index, 1);
      }

      return { ...prev, [field]: currentArray };
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
          <motion.div
            key="step1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Tell us about yourself
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="age">How old are you?</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter your age"
                  value={userData.age}
                  onChange={(e) => updateUserData("age", e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="country">Where are you located?</Label>
                <Select
                  value={userData.country}
                  onValueChange={(value) => updateUserData("country", value)}
                >
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select your country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="usa">United States</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    <SelectItem value="australia">Australia</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Education & Identity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="schoolStatus">
                  What's your current education status?
                </Label>
                <Select
                  value={userData.schoolStatus}
                  onValueChange={(value) =>
                    updateUserData("schoolStatus", value)
                  }
                >
                  <SelectTrigger id="schoolStatus">
                    <SelectValue placeholder="Select your education status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">
                      High School Student
                    </SelectItem>
                    <SelectItem value="undergraduate">
                      Undergraduate Student
                    </SelectItem>
                    <SelectItem value="graduate">Graduate Student</SelectItem>
                    <SelectItem value="recent-graduate">
                      Recent Graduate
                    </SelectItem>
                    <SelectItem value="not-in-school">
                      Not Currently in School
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="genderIdentity">
                  What's your gender identity?
                </Label>
                <RadioGroup
                  value={userData.genderIdentity}
                  onValueChange={(value) =>
                    updateUserData("genderIdentity", value)
                  }
                  className="grid grid-cols-2 gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="woman" id="woman" />
                    <Label htmlFor="woman">Woman</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="man" id="man" />
                    <Label htmlFor="man">Man</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="non-binary" id="non-binary" />
                    <Label htmlFor="non-binary">Non-binary</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="prefer-not-to-say"
                      id="prefer-not-to-say"
                    />
                    <Label htmlFor="prefer-not-to-say">Prefer not to say</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Financial Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="incomeBracket">
                  What's your annual income bracket?
                </Label>
                <Select
                  value={userData.incomeBracket}
                  onValueChange={(value) =>
                    updateUserData("incomeBracket", value)
                  }
                >
                  <SelectTrigger id="incomeBracket">
                    <SelectValue placeholder="Select your income bracket" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-25k">Under $25,000</SelectItem>
                    <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50k-75k">$50,000 - $75,000</SelectItem>
                    <SelectItem value="75k-100k">$75,000 - $100,000</SelectItem>
                    <SelectItem value="over-100k">Over $100,000</SelectItem>
                    <SelectItem value="prefer-not-to-say">
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  This helps us match you with income-based grants and
                  scholarships.
                </p>
              </div>
            </CardContent>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            key="step4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Fields of Interest
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label>Select all that apply to you:</Label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {[
                    "Computer Science",
                    "Engineering",
                    "Business",
                    "Arts",
                    "Healthcare",
                    "Education",
                    "Social Sciences",
                    "Natural Sciences",
                    "Humanities",
                    "Law",
                    "Environmental Studies",
                    "Mathematics",
                  ].map((field) => (
                    <div key={field} className="flex items-center space-x-2">
                      <Checkbox
                        id={field.toLowerCase().replace(" ", "-")}
                        checked={userData.fieldsOfInterest.includes(field)}
                        onCheckedChange={() =>
                          toggleArrayItem("fieldsOfInterest", field)
                        }
                      />
                      <Label htmlFor={field.toLowerCase().replace(" ", "-")}>
                        {field}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Additional Identifiers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label>Select all that apply to you:</Label>
                <p className="text-sm text-muted-foreground">
                  This information helps us match you with grants specifically
                  for underrepresented groups.
                </p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  {[
                    "BIPOC",
                    "LGBTQ+",
                    "First Generation Student",
                    "Low Income",
                    "Newcomer/Immigrant",
                    "Person with Disability",
                    "Indigenous",
                    "Veteran",
                  ].map((identifier) => (
                    <div
                      key={identifier}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={identifier.toLowerCase().replace(" ", "-")}
                        checked={userData.identifiers.includes(identifier)}
                        onCheckedChange={() =>
                          toggleArrayItem("identifiers", identifier)
                        }
                      />
                      <Label
                        htmlFor={identifier.toLowerCase().replace(" ", "-")}
                      >
                        {identifier}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
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
          <span>
            Step {step} of {totalSteps}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
      </div>

      <Card className="w-full">
        {renderStep()}

        <CardFooter className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>

          <Button onClick={handleNext} className="flex items-center gap-2">
            {step === totalSteps ? (
              <>
                Complete <Check className="h-4 w-4" />
              </>
            ) : (
              <>
                Next <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OnboardingFlow;
