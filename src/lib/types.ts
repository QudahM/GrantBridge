export interface UserProfile {
  age: number;
  country: string;
  gender: string;
  citizenship: string;
  education: string;
  degreeType: string;
  yearOfStudy: string;
  fieldOfStudy: string;
  gpa: string;
  incomeBracket: string;
  financialNeed: boolean;
  ethnicity: string;
  identifiers: string[];
}

export interface Grant {
  id: string;
  title: string;
  organization: string;
  amount: string;
  deadline: string;
  eligibility: string[];
  requirements: string[];
  description: string;
  tags: string[];
  difficulty: "Easy" | "Medium" | "Hard";
}
