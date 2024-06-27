import { Component, OnInit } from '@angular/core';
import { IDocOptions, SurveyPDF } from 'survey-pdf';
import { json, surveyData } from '../survey';
import { Model } from 'survey-core';
import 'survey-core/survey.i18n';
import 'survey-creator-core/survey-creator-core.i18n';

enum Mode {
  EDIT = 'edit',
  DISPLAY = 'display'
};

const hexaColors = {
  white: '#ffffff'
};

const otherChoiceText = 'Other (describe): ____________________________________';

@Component({
  selector: "component-survey-creator",
  templateUrl: "./creator.component.html",
  styleUrls: ["./creator.component.scss"],
})
export class SurveyCreatorComponent implements OnInit {
  surveyModel!: Model;

  ngOnInit() {
    const survey = new Model(json);

    survey.addNavigationItem({
      id: "pdf-export-display-mode",
      title: "Save as PDF survey",
      action: () => savePdf(survey.data)
    });

    // survey.data = surveyData;
    this.surveyModel = survey;
  }
}

const savePdf = function (surveyData: any, mode: Mode = Mode.DISPLAY) {
  console.log({ surveyData })
  const pdfWidth = !!surveyData && surveyData.pdfWidth ? surveyData.pdfWidth : 210;
  const pdfHeight = !!surveyData && surveyData.pdfHeight ? surveyData.pdfHeight : 297;
  const a4FormatMargin = 25.4;

  const pdfDocOptions: IDocOptions = {
    format: [pdfWidth, pdfHeight],
    fontSize: 12,
    fontName: 'Helvetica',
    margins: {
      top: a4FormatMargin,
      left: a4FormatMargin,
      right: a4FormatMargin,
      bot: a4FormatMargin
    }
  };

  const surveyPdf = new SurveyPDF(json, pdfDocOptions);
  surveyPdf.data = surveyData;
  surveyPdf.mode = 'display';

  surveyPdf.save();
};
