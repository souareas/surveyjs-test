import { Action, ItemValue, Model, QuestionFactory } from 'survey-core';
import { CommentBrick, FlatSurvey, IDocOptions, IPdfBrick, SurveyHelper, SurveyPDF, TextBrick } from 'survey-pdf';
import { Component, OnInit } from '@angular/core';
import { json, surveyData, surveyJson } from '../survey';
import { SurveyCreatorModel } from 'survey-creator-core';
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
  styleUrls: ["./creator.component.css"],
})
export class SurveyCreatorComponent implements OnInit {
  surveyModel!: Model;
  surveyCreatorModel!: SurveyCreatorModel;

  ngOnInit() {
    const survey = new Model(surveyJson);
    const creatorOptions = {
      showLogicTab: true,
      isAutoSave: true
    };

    const creator = new SurveyCreatorModel(creatorOptions);

    const downloadPdfAction = new Action({
      id: "pdf-export-edit-mode",
      title: "Save as PDF Survey creator",
      action: () => savePdf(json, Mode.EDIT)
    });
    creator.toolbarItems.unshift(downloadPdfAction);
    creator.JSON = json;
    this.surveyCreatorModel = creator;

    survey.addNavigationItem({
      id: "pdf-export-display-mode",
      title: "Save as PDF survey",
      action: () => savePdf(survey.data)
    });

    survey.data = surveyData;
    this.surveyModel = survey;
  }
}

const savePdf = function (surveyData: any, mode: Mode = Mode.DISPLAY) {
  console.log({ surveyData })
  const pdfWidth = !!surveyData && surveyData.pdfWidth ? surveyData.pdfWidth : 210;
  const pdfHeight = !!surveyData && surveyData.pdfHeight ? surveyData.pdfHeight : 297;
  const a4FormatMargin = 25.4;

  // FlatSurvey.QUES_GAP_VERT_SCALE = mode === Mode.EDIT ? 0.0 : 1.0;

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

  const surveyPdf = new SurveyPDF(surveyJson, pdfDocOptions);
  surveyPdf.data = surveyData;
  surveyPdf.showInvisibleElements = true;
  surveyPdf.mode = 'display';

  surveyPdf.onRenderQuestion.add(async (survey, options) => {
    const question = options.question;

    if (question.getType() === 'boolean') {
      const radioQuestion = QuestionFactory.Instance.createQuestion("radiogroup", `${question.no ?? ''} ${question.title}`);

      radioQuestion.choices = [
        new ItemValue(true, question.locLabelTrue?.values?.en ?? question.locLabelTrue?.values?.default ?? "Yes"),
        new ItemValue(false, question.locLabelFalse?.values?.en ?? question.locLabelFalse?.values?.default ?? "No")
      ];

      const flatRadiogroup = options.repository.create(survey, radioQuestion, options.controller, "radiogroup");

      const dropdownBrick = options.bricks.shift();

      if (dropdownBrick) {
        const point = SurveyHelper.createPoint(dropdownBrick, true, true);

        const radioBricks = await flatRadiogroup.generateFlats(point);

        options.bricks.forEach(blocsBriques => {
          const briques = blocsBriques.unfold();
          if (briques.length > 1) {
            briques.forEach(brique => {
              if (brique instanceof TextBrick) {
                (brique as any).text = otherChoiceText;
                brique.yTop += 35;
                brique.formBorderColor = hexaColors.white;
              } else if (brique && brique instanceof CommentBrick) {
                // brique.formBorderColor = hexaColors.white;
                brique.formBorderColor = 'red';
                brique.xLeft -= 5;
                if (mode === Mode.DISPLAY) {
                  brique.yTop += 20;
                  brique.yBot += 15;
                }

                // if (mode === Mode.EDIT) {
                //   brique.yTop -= 4;
                //   brique.yBot -= 1;
                // }
              }
            });
          }
        });

        options.bricks.push(...radioBricks);
      }
    }
  });

  surveyPdf.save();
};
