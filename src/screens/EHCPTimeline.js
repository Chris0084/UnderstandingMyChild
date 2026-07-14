import React, { useState, useEffect } from 'react'; // Added useEffect
import { View, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Added AsyncStorage
import PageHeader from '../components/PageHeader';
import TimelineStepCard from '../components/TimelineStepCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '../constants/Colors';

const STORAGE_KEY = '@ehcp_timeline_steps'; // Unique key for storage

export const INITIAL_STEPS = [
  {
    stepNumber: 1,
    title: 'SEN Support',
    weekLabel: 'Before Request',
    summary:
      'The targeted support your child receives within their current school setting before any formal legal requests are made.',
    parentRole: 'Gather everyday evidence.',
    parentRole2: 'Capture Moments to record behaviours, triggers, and impact.',
    parentRole3:
      'Use the Journal to review and shortlist moments to share with the SENCO.',
    details:
      'At this early stage, teachers and the SENCO try small changes. Your job is to collect clear examples. When your child has a moment of big feelings, overwhelm, or a sensory struggle, open Capture a Moment and write what happened. Add a photo or quick video if it helps.',
    details2:
      'These moments build a simple timeline. Before your school meeting, go to the Journal page and pick the entries that show the biggest challenges or trends. This gives you a clear idea that you can give to school staff.',
    sourceUrl:
      'https://www.ipsea.org.uk/pages/category/education-health-and-care-plans',
    sourceUrlLabel: 'IPSEA - Education, Health and Care Plans',
    completed: false,
  },
  {
    stepNumber: 2,
    title: 'Requesting an EHCP Needs Assessment',
    weekLabel: 'Week 0',
    summary:
      'The official starting point of the legal timeline. Parents, young people, or the educational setting formally request that the Local Authority evaluate.',
    parentRole: 'Formally submit your request packet to the Local Authority.',
    parentRole2:
      'Use your Journal or Trends and back up your written parental statement.',
    details:
      'You don’t need a diagnosis or the school’s permission to make a parental request. Write a simple letter to your Local Authority saying you want an EHC needs assessment. To make your request strong, include clear examples from your app’s Journal with dates, what happened, how often it happens, and any photos or videos. This shows the LA that your child’s needs continue over time, even with school support. Once the LA gets your request, the 20‑week legal timeline begins.',
    sourceUrl: 'https://www.ipsea.org.uk/asking-for-an-ehc-needs-assessment',
    sourceUrlLabel: 'IPSEA - Asking for an EHCP Needs Assessment',
    completed: false,
  },
  {
    stepNumber: 3,
    title: 'LA Decision to Assess',
    weekLabel: 'By Week 6',
    summary:
      'The Local Authority formally announces whether they will agree to move forward with a legal evaluation.',
    parentRole: 'Closely monitor communications from the LA.',
    parentRole2:
      'Keep capturing new Moments to strengthen your position in case you need to appeal.',
    parentRole3: 'Keep capturing what works or doesn’t to show Trends',
    details:
      'By week 6, the Local Authority must give a clear yes or no. They only look at two things: whether your child may have special educational needs, and whether they might need support that goes beyond the school’s usual budget. If the LA says yes, the full assessment begins. If they say no, don’t panic you can appeal with support from advice groups like IPSEA. Don’t lose hope. In England, around 20–25% of parental requests for an EHC needs assessment are refused each year on average over the last five years. But appeals are very strong: parents win about 99% of decided Tribunal cases. So if you get a ‘no’, it doesn’t mean the end. Keep logging daily Moments, this evidence can make a big difference if you go to mediation or appeal.',
    sourceUrl: 'https://www.ipsea.org.uk/faqs/ehc-needs-assessment-quick-guide',
    sourceUrlLabel: 'IPSEA - FAQs',
    sourceUrl2:
      'https://explore-education-statistics.service.gov.uk/find-statistics/education-health-and-care-plans/2024/explore?utm_source=copilot.com',
    sourceUrl2Label: 'Gov.uk - EHCP Statistics',
    sourceUrl3:
      'https://www.brownejacobson.com/insights/send-tribunal-data-released?utm_source=copilot.com',
    sourceUrl3Label: 'Brown & Jacobson - Tribunal Data',
    completed: false,
  },
  {
    stepNumber: 4,
    title: 'EHCP Needs Assessment Phase',
    weekLabel: 'Weeks 6–16',
    summary:
      "An intensive 10-week investigation period where various specialists evaluate your child's needs.",
    parentRole:
      'Keep track of visiting specialists (Educational Psychologists, Speech Therapists, etc).',
    parentRole2:
      ' Share your Starred Journal moments so get a sense of your child at home,',
    details:
      'The Local Authority will ask different professionals to write reports — teachers, health staff, therapists and psychologists. When they meet your child, they often only see them for a short time. You can help them understand your child much better by sharing your app’s Journal history. Giving a speech therapist or psychologist a simple list of real‑life moments — with photos or short videos — helps them see what your child’s day‑to‑day challenges are really like, not just what happens in a quick 45‑minute appointment.',
    sourceUrl:
      'https://www.ipsea.org.uk/what-happens-in-an-ehc-needs-assessment',
    sourceUrlLabel: 'IPSEA - What Happens in an EHCP Needs Assessment',
    completed: false,
  },
  {
    stepNumber: 5,
    title: 'LA Decision to Issue a Plan',
    weekLabel: 'By Week 16',
    summary:
      'The Local Authority states whether the expert reports prove a legally binding plan is necessary to secure the right support.',
    parentRole: "Review the LA's official decision letter.",
    parentRole2:
      'If they agree to issue, get ready to check the incoming draft against your Journal.',
    parentRole3:
      'Keep Capturing what works and what doesn’t to support the plan.',
    details:
      'By week 16, the LA looks at all gathered specialist advice to decide if an EHCP is necessary. If they refuse to issue a plan, they must explain why and provide a detailed roadmap for how the school should support your child moving forward. If they agree, they will immediately begin formatting the first draft. A refusal doesn’t stop the process, you can ask for mediation or appeal to the Tribunal. Most parents who appeal are successful, so a ‘no’ at this stage isn’t the end. You still have options and the law is on your side.',
    sourceUrl: 'https://www.ipsea.org.uk/ehc-needs-assessments',
    sourceUrlLabel: 'IPSEA - EHCP Decisions',
    completed: false,
  },
  {
    stepNumber: 6,
    title: 'Draft EHCP Review',
    weekLabel: 'Weeks 16–20',
    summary:
      'The first draft of the plan is shared with you, and you have a strict 15‑day window to ask for changes or name your preferred school.',
    parentRole:
      'Check Section F carefully and make sure every support your child needs is written clearly and specifically.',
    details:
      'Section F (Special Educational Provision) is the most important part of the whole plan because it is legally enforceable. You have 15 days to read the draft and request changes. Go through Section F line by line. If your child needs speech therapy three times a week, Section F must say exactly that. Watch out for vague words like ‘regular access’, ‘as required’, or ‘seeks to provide’. Ask for clear numbers, hours, and named specialists before you agree to the draft.',
    sourceUrl: 'https://www.ipsea.org.uk/what-an-ehc-plan-contains',
    sourceUrlLabel: 'IPSEA - What an EHCP Contains',
    completed: false,
  },
  {
    stepNumber: 7,
    title: 'Final EHCP Issued',
    weekLabel: 'Week 20',
    summary:
      'The final plan is issued. It confirms the named school and the funding that must be provided.',
    parentRole: 'Check that all agreed changes are included.',
    parentRole2: 'Confirm the named school.',
    parentRole3: 'Save copies safely.',
    details:
      'By week 20, the Local Authority must send you the final EHCP. The named school is confirmed, and the funding for support is activated. This plan is now a legal document: the LA and the school must provide every support, therapy, and resource written in Section F. Keep both digital and paper copies of this final version. It becomes your baseline for checking that the school is doing what the plan says.',
    sourceUrl: 'https://www.ipsea.org.uk/ehc-needs-assessments',
    sourceUrlLabel: 'IPSEA - EHCP Needs Assessments',
    completed: false,
  },
];

const EHCPTimeline = () => {
  const insets = useSafeAreaInsets();
  const [steps, setSteps] = useState(INITIAL_STEPS);

  useEffect(() => {
    loadSavedSteps();
  }, []);

  const loadSavedSteps = async () => {
    try {
      const savedData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedData !== null) {
        setSteps(JSON.parse(savedData));
      }
    } catch (error) {
      console.error('Failed to load timeline steps:', error);
    }
  };

  const toggleStepCompletion = async index => {
    try {
      const updatedSteps = [...steps];
      updatedSteps[index].completed = !updatedSteps[index].completed;
      setSteps(updatedSteps);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSteps));
    } catch (error) {
      console.error('Failed to save timeline steps:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PageHeader
        title="EHCP Timeline"
        iconName="list-circle-outline"
        accentColor={Colors.Ehcp_theme || '#FFE0B2'}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}>
        {steps.map((step, index) => (
          <TimelineStepCard
            key={step.stepNumber}
            stepNumber={step.stepNumber}
            title={step.title}
            weekLabel={step.weekLabel}
            summary={step.summary}
            parentRole={step.parentRole}
            parentRole2={step.parentRole2}
            parentRole3={step.parentRole3}
            parentRole4={step.parentRole4}
            parentRole5={step.parentRole5}
            expandedDetails={step.details}
            expandedDetails2={step.details2} // Pass detail block 2
            sourceUrl={step.sourceUrl}
            sourceUrlLabel={step.sourceUrlLabel} // Pass label 1
            sourceUrl2={step.sourceUrl2} // Pass URL 2
            sourceUrl2Label={step.sourceUrl2Label} // Pass label 2
            sourceUrl3={step.sourceUrl3} // Pass URL 3
            sourceUrl3Label={step.sourceUrl3Label} // Pass label 3
            isLast={index === steps.length - 1}
            isCompleted={step.completed}
            onToggleComplete={() => toggleStepCompletion(index)}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFC' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
});

export default EHCPTimeline;
