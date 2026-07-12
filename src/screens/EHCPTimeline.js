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
      'The targeted assistance your child receives within their current school setting before any formal legal requests are made.',
    parentRole:
      "Collate objective everyday evidence. Use this app's 'Moment Capture' feature to document behaviors, triggers, and impact, then use the 'Journal' to review, filter, and shortlist entries to share with the school's SENCO.",
    details:
      "During this foundational stage, teachers and the SENCO attempt explicit adjustments. Your main task as a parent is gathering undeniable evidence. Whenever your child experiences a challenging moment, an emotional episode, or an sensory bottleneck, open the app's 'Moment Capture' form immediately. Fill out the event details while they are fresh, and attach supporting images or video files directly to the entry to visually prove the impact. Over time, these snapshots build an unarguable digital timeline. Before your next school review, open the 'Journal' page to filter, review, and shortlist your most impactful logs into a clean summary packet that you can hand directly to the school staff as empirical proof of unmet needs.",
    sourceUrl:
      'https://www.ipsea.org.uk/pages/category/education-health-and-care-plans',
    completed: false,
  },
  {
    stepNumber: 2,
    title: 'Requesting an EHC Needs Assessment',
    weekLabel: 'Week 0',
    summary:
      'The official opening point of the legal timeline. Parents, young people, or the educational setting formally request that the Local Authority evaluate.',
    parentRole:
      "Formally submit your request packet to the Local Authority. Pull your historical 'Moment Capture' trends and shortlisted journal entries to back up your written parental statement.",
    details:
      "You do not need a formal diagnosis or the school's explicit permission to initiate a parental request. Write a clear, structured letter to your Local Authority stating your intent. To make your application stand out, do not rely on vague descriptions; instead, copy detailed event text, dates, frequency metrics, and media summaries directly out of your app's Journal history. This provides the LA with clear, historical data showing that your child's needs persist over time despite the school's baseline efforts. Once the LA receives this package, the strict statutory 20-week legal clock officially starts ticking.",
    sourceUrl: 'https://www.ipsea.org.uk/asking-for-an-ehc-needs-assessment',
    completed: false,
  },
  {
    stepNumber: 3,
    title: 'LA Decision to Assess',
    weekLabel: 'By Week 6',
    summary:
      'The Local Authority formally announces whether they will agree to move forward with a statutory evaluation.',
    parentRole:
      'Closely monitor communications from the LA. Keep capturing new daily data in the app to strengthen your position in case you need to dispute a refusal.',
    details:
      "By week 6, the LA must issue a definitive yes or no. Legally, they must only consider two criteria: Does the child have or potentially have special educational needs, and might they require support beyond standard school budgets? If the LA says yes, the formal multi-agency assessment kicks off. If they issue a refusal, do not panic—continue using 'Moment Capture' diligently every day. The fresh evidence you log now will be vital fuel for your legal team or independent advice organizations (like IPSEA) if you choose to enter mediation or launch a tribunal appeal.",
    sourceUrl: 'https://www.ipsea.org.uk/faqs/ehc-needs-assessment-quick-guide',
    completed: false,
  },
  {
    stepNumber: 4,
    title: 'EHC Needs Assessment Phase',
    weekLabel: 'Weeks 6–16',
    summary:
      "An intensive 10-week investigation period where various appointed specialists evaluate your child's functional requirements.",
    parentRole:
      "Coordinate with visiting specialists (Educational Psychologists, Speech Therapists). Hand them your app's shortlisted journal trends so they see how your child functions in real life.",
    details:
      "The Local Authority will commission formal reports from educational, medical, and psychological professionals. When meeting these specialists, their time observing your child is often brief. You can completely transform the accuracy of their assessments by providing them access to your app's Journal history. Handing a speech therapist or psychologist a structured list of real-world episodes, complete with video or photographic context captured in the moment, ensures their final professional reports reflect your child's true daily vulnerabilities rather than just how they behaved during a short, artificial 45-minute clinic appointment.",
    sourceUrl:
      'https://www.ipsea.org.uk/what-happens-in-an-ehc-needs-assessment',
    completed: false,
  },
  {
    stepNumber: 5,
    title: 'LA Decision to Issue a Plan',
    weekLabel: 'By Week 16',
    summary:
      'The Local Authority determines whether the gathered expert records prove a legally binding plan is necessary to secure adequate support.',
    parentRole:
      "Review the LA's official decision letter. If they agree to issue, get ready to analyze the incoming draft against your real-world app logs.",
    details:
      'By week 16, the LA looks at all gathered specialist advice to decide if an EHCP is necessary. If they refuse to issue a plan, they must explain why and provide a detailed roadmap for how the school should support your child moving forward. If they agree, they will immediately begin formatting the first draft. Continue using your app to log ongoing incidents during this waiting period, as this continuous data stream ensures your records remain completely unbroken as you move into the drafting stage.',
    sourceUrl: 'https://www.ipsea.org.uk/ehc-needs-assessments',
    completed: false,
  },
  {
    stepNumber: 6,
    title: 'Draft EHCP Review',
    weekLabel: 'Weeks 16–20',
    summary:
      'The initial formulation of the plan is shared, granting parents a strict 15-day review period to request modifications or name a preferred school.',
    parentRole:
      "Meticulously cross-reference Section F of the draft against your app's log history to ensure every single required support strategy is explicitly written out.",
    details:
      "Section F (Special Educational Provision) is the most critical part of the entire document because it is legally enforceable. You have exactly 15 days to review the draft and request changes. Read it line-by-line alongside your app's Journal. If your logs prove your child needs 1-on-1 speech therapy three times a week, make sure Section F explicitly states that. Watch out for vague, non-committal words like 'regular access', 'as required', or 'seeks to provide'. Use the precise, quantifiable evidence you captured in the app to demand that provisions are written with specific numbers, hours, and direct specialist titles before you sign off.",
    sourceUrl: 'https://www.ipsea.org.uk/what-an-ehc-plan-contains',
    completed: false,
  },
  {
    stepNumber: 7,
    title: 'Final EHCP Issued',
    weekLabel: 'Week 20',
    summary:
      'The official, legally binding document is finalized, confirming named placement details and structural resource funding rules.',
    parentRole:
      'Verify that all negotiated text updates were included, confirm the named school placement, and save copies securely.',
    details:
      'By week 20, the final, official plan must be legally issued by the Local Authority. The named school placement is locked in, and the specialized funding budget is activated. This document is a powerful legal shield: the local authority and the school are now legally mandated to deliver every single accommodation, therapy, and resource itemized in Section F. Securely archive both digital and physical copies of this final version, as it serves as your baseline standard for tracking school accountability moving forward.',
    sourceUrl: 'https://www.ipsea.org.uk/ehc-needs-assessments',
    completed: false,
  },
];

const EHCPTimeline = () => {
  const insets = useSafeAreaInsets();
  const [steps, setSteps] = useState(INITIAL_STEPS);

  // 1. Load data from disk when the screen opens
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

  // 2. Modified toggle function that writes directly to storage
  const toggleStepCompletion = async index => {
    try {
      const updatedSteps = [...steps];
      updatedSteps[index].completed = !updatedSteps[index].completed;

      // Update UI State
      setSteps(updatedSteps);

      // Save permanently to disk
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSteps));
    } catch (error) {
      console.error('Failed to save timeline steps:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <PageHeader
        title="EHCP Process"
        iconName="list-circle-outline"
        // accentColor="#0056B3"
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
            expandedDetails={step.details}
            sourceUrl={step.sourceUrl}
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
