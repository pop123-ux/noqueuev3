import React, { useState, useCallback } from 'react';
import workflows from '@/lib/data/workflows';
import Navbar from '@/components/noqueue/Navbar';
import Hero from '@/components/noqueue/Hero';
import ProblemCards from '@/components/noqueue/ProblemCards';
import WorkflowCards from '@/components/noqueue/WorkflowCards';
import InstitutionFinder from '@/components/noqueue/InstitutionFinder';
import SimulatedMap from '@/components/noqueue/SimulatedMap';
import QueueIntelligence from '@/components/noqueue/QueueIntelligence';
import DocumentChecklist from '@/components/noqueue/DocumentChecklist';
import Chatbot from '@/components/noqueue/Chatbot';
import SmartRecommendations from '@/components/noqueue/SmartRecommendations';
import DigitalRomaniaFit from '@/components/noqueue/DigitalRomaniaFit';
import Footer from '@/components/noqueue/Footer';

export default function Home() {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  const handleSelectWorkflow = useCallback((wf) => {
    setSelectedWorkflow(wf);
    // Scroll to checklist
    setTimeout(() => {
      document.getElementById('checklist')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleWorkflowDetected = useCallback((response) => {
    if (response.workflowId) {
      const wf = workflows.find(w => w.id === response.workflowId);
      if (wf) setSelectedWorkflow(wf);
    }
  }, []);

  const handleSelectInstitution = useCallback((inst) => {
    setSelectedInstitution(inst);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <Hero />
      <ProblemCards />
      <Chatbot onWorkflowDetected={handleWorkflowDetected} />
      <div id="checklist">
        <DocumentChecklist workflow={selectedWorkflow} />
      </div>
      <WorkflowCards onSelectWorkflow={handleSelectWorkflow} />
      <InstitutionFinder onSelectInstitution={handleSelectInstitution} />
      <SimulatedMap selectedInstitution={selectedInstitution} onSelectInstitution={handleSelectInstitution} />
      <QueueIntelligence />
      <SmartRecommendations />
      <DigitalRomaniaFit />
      <Footer />
    </div>
  );
}