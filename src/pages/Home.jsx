import React, { useState, useCallback } from 'react';
import workflows from '@/lib/data/workflows';
import { clujInstitutions } from '@/lib/data/clujInstitutions';
import Navbar from '@/components/noqueue/Navbar';
import Hero from '@/components/noqueue/Hero';
import ProblemCards from '@/components/noqueue/ProblemCards';
import NoQueueAIChat from '@/components/noqueue/NoQueueAIChat';
import DocumentChecklist from '@/components/noqueue/DocumentChecklist';
import WorkflowCards from '@/components/noqueue/WorkflowCards';
import InstitutionFinder from '@/components/noqueue/InstitutionFinder';
import ClujMap from '@/components/noqueue/ClujMap';
import QueueIntelligence from '@/components/noqueue/QueueIntelligence';
import SmartRecommendations from '@/components/noqueue/SmartRecommendations';

import DigitalRomaniaFit from '@/components/noqueue/DigitalRomaniaFit';
import MoveToRomaniaDashboardCard from '@/components/moveToRomania/MoveToRomaniaDashboardCard';
import SmartDocFeatureCard from '@/components/noqueue/SmartDocFeatureCard';
import Footer from '@/components/noqueue/Footer';

export default function Home() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  const handleSelectWorkflow = useCallback((wf) => {
    setSelectedWorkflow(wf);
    setTimeout(() => {
      document.getElementById('checklist')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleWorkflowDetected = useCallback(({ workflowId, institutionId }) => {
    if (workflowId) {
      const wf = workflows.find(w => w.id === workflowId);
      if (wf) setSelectedWorkflow(wf);
    }
    if (institutionId) {
      const inst = clujInstitutions.find(i => i.id === institutionId);
      if (inst) setSelectedInstitution(inst);
    }
  }, []);

  const handleSelectInstitution = useCallback((inst) => {
    setSelectedInstitution(inst);
    setTimeout(() => {
      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      <Navbar />
      <Hero />
      <ProblemCards />

      {/* AI Chat — main experience */}
      <NoQueueAIChat onWorkflowDetected={handleWorkflowDetected} />

      {/* Smart Document Intelligence — NoQueue AI 2.0 feature */}
      <SmartDocFeatureCard />

      {/* Dynamic checklist updates after chat interaction */}
      <div id="checklist">
        <DocumentChecklist workflow={selectedWorkflow} />
      </div>

      <InstitutionFinder onSelectInstitution={handleSelectInstitution} />

      {/* Premium Cluj Map */}
      <ClujMap
        selectedInstitution={selectedInstitution}
        onSelectInstitution={handleSelectInstitution}
      />

      <QueueIntelligence />

      {/* Move to Romania module — dashboard card */}
      <MoveToRomaniaDashboardCard />

      <SmartRecommendations />
      <DigitalRomaniaFit />
      <Footer />
    </div>
  );
}