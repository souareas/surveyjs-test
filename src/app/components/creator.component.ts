import { addFullNameCollection, EnumSurveyCustom, isUniqueToolbox } from './customs-component/customs-collection.component';
import { AfterViewInit, Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { ComponentCollection, Model, Serializer, surveyLocalization } from 'survey-core';
import { IQuestionToolboxItem, QuestionConvertMode, settings, SurveyCreatorModel } from 'survey-creator-core';
import { json } from '../survey';
import 'survey-core/survey.i18n';
import 'survey-creator-core/survey-creator-core.i18n';

settings.questionConvertMode = QuestionConvertMode.CompatibleTypes;

@Component({
  selector: "component-survey-creator",
  templateUrl: "./creator.component.html",
  styleUrls: ["./creator.component.css"],
})
export class SurveyCreatorComponent implements OnInit, AfterViewInit {
  public model?: SurveyCreatorModel;
  public model2!: Model;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}
  
  ngOnInit() {
    addFullNameCollection();

    const creator = new SurveyCreatorModel({
      showLogicTab: true,
      showJSONEditorTab: true,
      pageEditMode: "bypage",
    });
    
    creator.isAutoSave = true;
    creator.toolbox.allowExpandMultipleCategories = true;
    creator.toolbox.showCategoryTitles = true;

    creator.JSON = json;


    const fullNameExists = creator.survey.getAllQuestions(false, false, true).some(q => q.getType() === "fullname");
    
    if(fullNameExists){
          creator.toolbox.removeItem("fullname");
    }

    for (const type of isUniqueToolbox) {
      const toolboxCustom = EnumSurveyCustom[type as keyof typeof EnumSurveyCustom]
      creator.toolbox.addItem(toolboxCustom)
    }
    

    creator.onQuestionAdded.add((_, options) => {
      const questionType: string = options.question.getType();

      if (isUniqueToolbox.includes(questionType) && _.survey.getAllQuestions(false, false, true).some(q => q.getType() === questionType)) {
        console.log({questionType})
        // options.question.delete();
        creator.toolbox.removeItem(questionType);
      }
    });


    creator.onElementDeleting.add((_, options) => {
      const questionType: string = options.element.getType();

      if (isUniqueToolbox.includes(questionType)) {

        const item: IQuestionToolboxItem = creator.toolbox.getItemByName(questionType);
        const toolboxCustom = EnumSurveyCustom[questionType as keyof typeof EnumSurveyCustom]

        if(!item) {
          creator.toolbox.addItem(toolboxCustom)
        }
      }
    });

    this.model = creator;
  }

  ngAfterViewInit(): void {
    const elementLicence = this.elementRef.nativeElement.querySelector('.svc-creator__banner');
    if (elementLicence) {
      this.renderer.setStyle(elementLicence, 'display', 'none');
    }
  }
}
